$(function () {
  consoleInit();
  start(main);
});

async function main() {
  const App = await init_ethers();

  // input data
  const PAIR_ADDR = WETH_TBTC_SUSHI_PAIR;
  const STAKE_ADDR = MASTER_CHEF;
  const POOLID = 51; //find it from graphql
  const PAIR_NAME = 'WETH-TBTC';
  const token1_info = {
    address: WETH_TOKEN_ADDR,
    tick: 'WETH',
    pricetick: 'ethereum',
    decimal: 1e18,
  };
  const token2_info = {
    address: TBTC_TOKEN_ADDR,
    tick: 'TBTC',
    pricetick: 'tbtc',
    decimal: 1e18,
  };
  // input data ends

  _print(`Initialized ${App.YOUR_ADDRESS}`);
  _print('Reading smart contracts...\n');
  _print(`TBTC token Address: ${TBTC_TOKEN_ADDR}`);
  _print(`Sushiswap ${PAIR_NAME} pool address: ${PAIR_ADDR}`);
  _print(`Master Chef staking address: ${STAKE_ADDR}`);
  _print(`\n\n`);

  ///

  const STAKING_POOL = new ethers.Contract(
    STAKE_ADDR,
    STAKING_POOL_ABI,
    App.provider
  );

  const SUSHI_PAIR = new ethers.Contract(PAIR_ADDR, ERC20_ABI, App.provider);
  const TOKEN1 = new ethers.Contract(
    token1_info.address,
    ERC20_ABI,
    App.provider
  );
  const TOKEN2 = new ethers.Contract(
    token2_info.address,
    ERC20_ABI,
    App.provider
  );

  _print(`======= PRICES ==========`);
  const prices = await lookUpPrices([
    'sushi',
    token1_info.pricetick,
    token2_info.pricetick,
  ]);

  // figure out amount of value in pool;
  const token1Amount =
    (await TOKEN1.balanceOf(PAIR_ADDR)) / token1_info.decimal;
  const token2Amount =
    (await TOKEN2.balanceOf(PAIR_ADDR)) / token2_info.decimal;
  const poolValue =
    token1Amount * prices[token1_info.pricetick].usd +
    token2Amount * prices[token2_info.pricetick].usd;

  _print(`1 ${token1_info.tick} = $${prices[token1_info.pricetick].usd}`);
  _print(`1 ${token2_info.tick} = $${prices[token2_info.pricetick].usd}`);
  _print(`1 SUSHI = $${prices['sushi'].usd}`);
  _print(`\n`);

  _print(`======= STAKING ==========`);
  const totalLP = (await SUSHI_PAIR.totalSupply()) / 1e18;
  const stakedLP = (await SUSHI_PAIR.balanceOf(STAKE_ADDR)) / 1e18;
  const lpValuePerToken = poolValue / totalLP;
  const yourUnstakedLP = (await SUSHI_PAIR.balanceOf(App.YOUR_ADDRESS)) / 1e18;
  const userInfo = await STAKING_POOL.userInfo(POOLID, App.YOUR_ADDRESS);
  const yourStakedLP = userInfo[0] / 1e18;
  const stakingPoolPercentage = yourStakedLP / stakedLP;

  _print(
    `There are total   : ${toFixed(
      totalLP,
      6
    )} ${PAIR_NAME} LP token given out by Sushiswap.`
  );
  _print(
    `There are total   : ${toFixed(
      stakedLP,
      6
    )} ${PAIR_NAME} LP token staked in Sushi Bar.`
  );
  _print(`                  = ${toDollar(stakedLP * lpValuePerToken)} \n`);
  _print(
    `You are staking   : ${yourStakedLP} LP (${toFixed(
      stakingPoolPercentage,
      5
    )}% of the pool)`
  );
  _print(`                  = ${toDollar(yourStakedLP * lpValuePerToken)} \n`);

  _print(`======= SUSHI REWARDS =======`);
  const earnedSushi =
    (await STAKING_POOL.pendingSushi(POOLID, App.YOUR_ADDRESS)) / 1e18;

  const poolInfo = await STAKING_POOL.poolInfo(POOLID);
  const allocPoint = poolInfo[1];
  const lastRewardBlock = poolValue[2];
  const accSushiPerShare = poolValue[3]; // times 12

  const sushiPerBlock = (await STAKING_POOL.sushiPerBlock()) / 1e18;

  const totalAllocPoint = await STAKING_POOL.totalAllocPoint();

  if (allocPoint == 0) {
    // if allocPoint is zero, showing suspended info
    _print(`Rewards from this pool is temporarily suspended `);
  } else {
    // calculate weekly reward of SUSHI;
    const weeklyTotalReward =
      (sushiPerBlock * 6430 * 7 * allocPoint) / totalAllocPoint;

    const weeklyRewardPerToken = weeklyTotalReward / stakedLP;
    // console.log(weeklyRewardPerToken);
    _print(`Claimable Rewards : ${earnedSushi} SUSHI`);
    _print(
      `                  = ${toDollar(earnedSushi * prices['sushi'].usd)}\n`
    );
    _print(
      `Weekly estimate   : ${
        weeklyRewardPerToken * yourStakedLP
      } SUSHI (out of total ${toFixed(
        weeklyTotalReward,
        4
      )} SUSHI from this pool)`
    );
    _print(
      `                  = ${toDollar(
        weeklyRewardPerToken * yourStakedLP * prices['sushi'].usd
      )}`
    );
    const SUSHIWeeklyROI =
      (weeklyRewardPerToken * prices['sushi'].usd * 100) / lpValuePerToken;
    _print(
      `Weekly ROI in USD : ${toFixed(
        SUSHIWeeklyROI,
        4
      )}% (vesting SUSHI excluded)`
    );
    _print(`APR (unstable)    : ${toFixed(SUSHIWeeklyROI * 52, 4)}% \n`);
  }

  // _print(`======= KEEP REWARDS ======`);
  // _print(`    Not distributed yet`);
  // //  const earnedCRV = await STAKEING_POOL.claimable_token(App.YOUR_ADDRESS);
  // // _print(`\n`);
  // // //  uniswap pool stats

  hideLoading();
}
