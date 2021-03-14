$(function () {
  consoleInit();
  start(main);
});

async function main() {
  const App = await init_ethers();

  // input data
  const PAIR_ADDR = TBTC_ETH_UNILP;
  const STAKE_ADDR = TBTC_ETH_STAKE;
  const PAIR_NAME = 'TBTC-ETH';
  const token2_info = {
    address: WETH_TOKEN_ADDR,
    tick: 'WETH',
    pricetick: 'ethereum',
    decimal: 1e18,
  };
  const token1_info = {
    address: TBTC_TOKEN_ADDR,
    tick: 'TBTC',
    pricetick: 'tbtc',
    decimal: 1e18,
  };
  // input data ends

  _print(`Initialized ${App.YOUR_ADDRESS}`);
  _print('Reading smart contracts...\n');
  _print(`TBTC token Address: ${TBTC_TOKEN_ADDR}`);
  _print(`Uniswap ${PAIR_NAME} pool address: ${PAIR_ADDR}`);
  _print(`LP staking address: ${STAKE_ADDR}`);
  _print(`\n\n`);

  ///

  const STAKING_POOL = new ethers.Contract(
    STAKE_ADDR,
    STAKING_POOL_ABI,
    App.provider
  );

  const UNI_PAIR = new ethers.Contract(PAIR_ADDR, ERC20_ABI, App.provider);
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
    'keep-network',
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

  console.log(token1Amount);
  console.log(token2Amount);
  _print(`1 ${token1_info.tick} = $${prices[token1_info.pricetick].usd}`);
  _print(`1 ${token2_info.tick} = $${prices[token2_info.pricetick].usd}`);
  _print(`\n`);

  _print(`======= STAKING ==========`);
  const totalLP = (await UNI_PAIR.totalSupply()) / 1e18;
  const stakedLP = (await UNI_PAIR.balanceOf(STAKE_ADDR)) / 1e18;
  const lpValuePerToken = poolValue / totalLP;
  const yourUnstakedLP = (await UNI_PAIR.balanceOf(App.YOUR_ADDRESS)) / 1e18;
  const yourStakedLP = (await STAKING_POOL.balanceOf(App.YOUR_ADDRESS)) / 1e18;
  const stakingPoolPercentage = yourStakedLP / stakedLP;
  const unstakingPoolPercentage = yourUnstakedLP / stakedLP;

  _print(
    `There are total   : ${toFixed(
      totalLP,
      6
    )} ${PAIR_NAME} LP token given out by Uniswap.`
  );
  _print(
    `There are total   : ${toFixed(
      stakedLP,
      6
    )} ${PAIR_NAME} LP token staked in the KEEP staking contract.`
  );
  _print(`                  = ${toDollar(stakedLP * lpValuePerToken)} \n`);
  _print(
    `You are staking   : ${yourStakedLP} LP (${toFixed(
      stakingPoolPercentage * 100,
      5
    )}% of the pool)`
  );
  _print(`                  = ${toDollar(yourStakedLP * lpValuePerToken)}`);
  _print(
    `Your unstaked LP  : ${yourUnstakedLP} LP (${toFixed(
      unstakingPoolPercentage * 100,
      5
    )}% of the pool)`
  );
  _print(
    `                  = ${toDollar(yourUnstakedLP * lpValuePerToken)} \n`
  );

  _print(`======= KEEP REWARDS ======`);
  const earnedKEEP = (await STAKING_POOL.earned(App.YOUR_ADDRESS)) / 1e18;
  const weeklyKeepReward = (await get_keep_weekly_rewards(STAKING_POOL)) / 1e18;
  const keepRewardPerToken = weeklyKeepReward / stakedLP;
  console.log(weeklyKeepReward);
  _print(`Claimable Rewards : ${earnedKEEP} KEEP`);
  _print(
    `                  = ${toDollar(earnedKEEP * prices['keep-network'].usd)}\n`
  );
  const expired = await isExpired(STAKING_POOL);
  console.log(expired);
  if (expired) {
    _print('Currently this staking pool is NOT active');
  } else {
    _print(
      `Weekly estimate   : ${
        keepRewardPerToken * yourStakedLP
      } KEEP (out of total ${toFixed(weeklyKeepReward, 1)} KEEP)`
    );
    _print(
      `                  = ${toDollar(
        keepRewardPerToken * yourStakedLP * prices['keep-network'].usd
      )}`
    );
    const KeepWeeklyROI =
      (keepRewardPerToken * prices['keep-network'].usd * 100) / lpValuePerToken;
    console.log('keepRewrd per token:', keepRewardPerToken);

    _print(`Weekly ROI in USD : ${toFixed(KeepWeeklyROI, 4)}%`);
    _print(`APR (unstable)    : ${toFixed(KeepWeeklyROI * 52, 4)}% \n`);
  }
  // add method to stake, unstake, harvest method
  const stake = async function () {
    let amount = await UNI_PAIR.balanceOf(App.YOUR_ADDRESS);
    return uni_stake(PAIR_ADDR, STAKE_ADDR, amount, App);
  };

  const harvest = async function () {
    return uni_harvest(STAKE_ADDR, App);
  };

  const unstake = async function () {
    return uni_unstake(STAKE_ADDR, App);
  };

  _print(`\n\n`);
  _print_link(`Stake your LP`, stake);
  _print_link(`Unstake your LP`, unstake);
  _print_link(`Harvest KEEP`, harvest);

  hideLoading();
}
