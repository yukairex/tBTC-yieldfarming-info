$(function () {
  consoleInit();
  start(main);
});

async function main() {
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

  const CRV_GAUGECONTROL = new ethers.Contract(
    CRV_GAUGE_CONTROLLER,
    CRV_GAUGE_CONTROLLER_ABI,
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
  const crvTBTCPoolLPPrice = prices['wrapped-bitcoin'].usd;

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

  _print(
    `There are total   : ${toFixed(
      totalLP,
      4
    )} tbtcCrv LP token given out by Curve.`
  );
  _print(
    `There are total   : ${toFixed(
      stakedLP,
      4
    )} tbtcCrv LP token staked in curve gauge's pool.`
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

  console.log(CRV_GAUGECONTROL.gauge_relative_weight);
  // pool relative weight
  const gaugeWeight =
    (await CRV_GAUGECONTROL.gauge_relative_weight(TBTC_CRV_GAUGE)) / 1e18;
  const weeklyTotalReward =
    (await get_CRV_weekly_rewards(STAKEING_POOL)) * gaugeWeight;

  const weeklyRewardPerToken = weeklyTotalReward / stakedLP;
  console.log(weeklyRewardPerToken);
  _print(`Claimable Rewards : ${earnedCRV} CRV`);
  _print(
    `                  = ${toDollar(
      earnedCRV * prices['curve-dao-token'].usd
    )}\n`
  );
  _print(
    `Weekly estimate   : ${
      weeklyRewardPerToken * yourStakedLP
    } CRV (out of total ${toFixed(weeklyTotalReward, 4)} CRV)`
  );
  _print(
    `                  = ${toDollar(
      weeklyRewardPerToken * yourStakedLP * prices['curve-dao-token'].usd
    )}`
  );
  const CRVWeeklyROI =
    (weeklyRewardPerToken * prices['curve-dao-token'].usd * 100) /
    crvTBTCPoolLPPrice;
  _print(`Weekly ROI in USD : ${toFixed(CRVWeeklyROI, 4)}%`);
  _print(`APR (unstable)    : ${toFixed(CRVWeeklyROI * 52, 4)}% \n`);

  _print(`======= KEEP REWARDS ======`);
  _print(`    Not distributed yet`);
  //  const earnedCRV = await STAKEING_POOL.claimable_token(App.YOUR_ADDRESS);
  // _print(`\n`);
  // //  uniswap pool stats

  hideLoading();
}
