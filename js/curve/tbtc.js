$(function () {
  consoleInit();
  start(main);
});

async function main() {
  print_warning();

  const App = await init_ethers();

  _print(`Initialized ${App.YOUR_ADDRESS}`);
  _print('Reading smart contracts...\n');
  _print(`TBTC token Address: ${TBTC_TOKEN_ADDR}`);
  _print(`Curve tBTC meta pool address: ${TBTC_CRV_POOL}`);
  _print(
    `Curve tBTC meta pool LP token address: ${TBTC_CRV_METAPOOL_LP_TOKEN}`
  );
  _print(`\n\n`);

  ///

  const CRV_LP_ERC20 = new ethers.Contract(
    TBTC_CRV_METAPOOL_LP_TOKEN,
    ERC20_ABI,
    App.provider
  );

  const CRV_LP_POOL = new ethers.Contract(
    TBTC_CRV_POOL,
    CRV_METAPOOL_ABI,
    App.provider
  );

  const STAKEING_POOL = new ethers.Contract(
    TBTC_CRV_GAUGE,
    STAKING_ABI,
    App.provider
  );

  _print(`======= PRICES ==========`);
  const prices = await lookUpPrices([
    'tbtc',
    'wrapped-bitcoin',
    'sbtc',
    'renbtc',
    'curve-dao-token',
    'keep-network',
  ]);

  // didn't find crv lp token price from coingecko
  const crvTBTCPoolLPPrice = prices['tbtc'].usd;

  _print(`1 tBTC = $${prices['tbtc'].usd}`);
  _print(`1 WBTC = $${prices['wrapped-bitcoin'].usd}`);
  _print(`1 sBTC = $${prices['sbtc'].usd}`);
  _print(`1 renBTC = $${prices['renbtc'].usd}`);
  _print(`1 CRV = $${prices['curve-dao-token'].usd}`);
  _print(`1 KEEP = $${prices['keep-network'].usd}`);
  _print(`\n`);

  _print(`======= STAKING ==========`);
  const totalLP = (await CRV_LP_ERC20.totalSupply()) / 1e18;
  const stakedLP = (await STAKEING_POOL.totalSupply()) / 1e18;
  const yourUnstakedLP =
    (await CRV_LP_ERC20.balanceOf(App.YOUR_ADDRESS)) / 1e18;
  const yourStakedLP = (await STAKEING_POOL.balanceOf(App.YOUR_ADDRESS)) / 1e18;
  const stakingPoolPercentage = yourStakedLP / stakedLP;

  _print(`There are total   : ${totalLP} tbtcCrv LP token given out by Curve.`);
  _print(
    `There are total   : ${stakedLP} tbtcCrv LP token staked in curve gauge's pool.`
  );
  _print(`                  = ${toDollar(stakedLP * crvTBTCPoolLPPrice)} \n`);
  _print(
    `You are staking   : ${yourStakedLP} LP (${toFixed(
      stakingPoolPercentage,
      5
    )}% of the pool)`
  );
  _print(
    `                  = ${toDollar(yourStakedLP * crvTBTCPoolLPPrice)} \n`
  );

  _print(`======= CRV REWARDS =======`);
  const earnedCRV =
    (await STAKEING_POOL.claimable_tokens(App.YOUR_ADDRESS)) / 1e18;
  const inflation_rate = (await STAKEING_POOL.inflation_rate()) / 1e18;
  // weekly estimate;
  const etherBlockRate = 15; // sec;
  const weeklyTotalReward =
    (60 / etherBlockRate) * 60 * 24 * 7 * inflation_rate * 0.0203;
  const weeklyRewardPerToken = weeklyTotalReward / stakedLP;
  _print(`Claimable Rewards : ${earnedCRV} CRV`);
  _print(
    `                  = ${toDollar(
      earnedCRV * prices['curve-dao-token'].usd
    )}\n`
  );
  _print(`\n`);
  _print(
    `Weekly estimate   : ${
      weeklyRewardPerToken * yourStakedLP
    } CRV (out of total ${weeklyTotalReward} CRV)`
  );
  _print(
    `                  = ${toDollar(
      weeklyRewardPerToken * yourStakedLP * prices['curve-dao-token'].usd
    )}`
  );
  const CRVWeeklyROI =
    (weeklyRewardPerToken * prices['curve-dao-token'].usd * 100) /
    crvTBTCPoolLPPrice;
  _print(`Weekly ROI in USD : ${toFixed(weeklyRewardPerToken, 4)}%`);
  _print(`APR (unstable)    : ${toFixed(weeklyRewardPerToken * 52, 4)}% \n`);

  // _print(`======= KEEP REWARDS ======`);
  // _print(`    Not distributed yet`);
  //  const earnedCRV = await STAKEING_POOL.claimable_token(App.YOUR_ADDRESS);
  // _print(`\n`);
  // //  uniswap pool stats

  hideLoading();
}
