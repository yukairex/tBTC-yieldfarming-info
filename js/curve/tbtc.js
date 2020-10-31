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
  const earnedCRV = await STAKEING_POOL.claimable_reward(App.YOUR_ADDRESS);
  console.log(earnedCRV);
  _print(`Claimable Rewards : ${earnedCRV} CRV`);
  _print(
    `                  = ${toDollar(
      earnedCRV * prices['curve-dao-token'].usd
    )}\n`
  );
  _print(`\n`);
  // _print(
  //   `Weekly estimate   : ${
  //     rewardPerToken * stakedCRVAmount
  //   } SNX (out of total ${weekly_reward} SNX)`
  // );
  // _print(
  //   `                  = ${toDollar(
  //     rewardPerToken * stakedCRVAmount * SNXPrice
  //   )}`
  // );
  // const SNXWeeklyROI =
  //   (rewardPerToken * SNXPrice * 100) / crvPlain3andSUSDPricePerToken;
  // _print(`Weekly ROI in USD : ${toFixed(SNXWeeklyROI, 4)}%`);
  // _print(`APR (unstable)    : ${toFixed(SNXWeeklyROI * 52, 4)}% \n`);

  // _print(`======= KEEP REWARDS ======`);
  // _print(`    Not distributed yet`);
  // _print(`\n`);
  // //  uniswap pool stats
  // _print(`=======SEAL-${TOKEN_ADDR.tick} POOL ==========`);
  // const tokenInUniPool =
  //   (await ERC20TOKEN.balanceOf(TOKEN_ADDR.pair)) / TOKEN_ADDR.denom;
  // const sealInUniPool = (await SEAL.balanceOf(TOKEN_ADDR.pair)) / 1e18;
  // const prices = await lookUpPrices([
  //   TOKEN_ADDR.pricetick,
  //   'seal-finance',
  //   'ethereum',
  // ]);
  // console.log(prices);

  // _print(`1 ${TOKEN_ADDR.tick}  = $${prices[TOKEN_ADDR.pricetick].usd}`);
  // _print(`1 SEAL  = $${prices[`seal-finance`].usd}`);
  // _print(
  //   `${TOKEN_ADDR.tick} in pair: ${tokenInUniPool}, worth: ${toDollar(
  //     tokenInUniPool * prices[TOKEN_ADDR.pricetick].usd
  //   )} `
  // );
  // _print(
  //   `SEAL in pair: ${sealInUniPool}, worth: ${toDollar(
  //     sealInUniPool * prices['seal-finance'].usd
  //   )} `
  // );
  // const withdrawRate = (await STAKING_POOL.withdrawRate()) / 1e18;
  // _print(`withdrawl fee [%]: ${toFixed((1 - withdrawRate) * 100, 2)}%`);
  // _print(`\n\n`);

  // _print('========== BREED STATS ==========');
  // const now = Math.floor(Date.now() / 1000);
  // const today = await STAKING_POOL.today();
  // const nowInDay = Math.floor(now / (24 * 60 * 60));
  // if (nowInDay > today) {
  //   _print(`breeding happening`);
  // } else {
  //   _print(`breeding in ${forHumans((nowInDay + 1) * 24 * 60 * 60 - now)}`);
  // }
  // const totalLP = (await UNISWAP_PAIR.totalSupply()) / 1e18;
  // const spawnRate = (await STAKING_POOL.spawnRate()) / 1e18;
  // const newSeal = sealInUniPool * spawnRate;
  // const newSealToCreate = newSeal * 2;
  // const newLPtoCreate = (newSeal / sealInUniPool) * totalLP;
  // const newValueBreed = newSealToCreate * prices['seal-finance'].usd;
  // const newValueBreedInPercent =
  //   newValueBreed / (sealInUniPool * prices['seal-finance'].usd * 2);
  // _print(`seal to spawn: ${newSealToCreate}`);
  // _print(`LP token to create: ${newLPtoCreate}`);
  // _print(`breeding value: ${toDollar(newValueBreed)}`);
  // _print(`breeding value in [%]: ${toFixed(newValueBreedInPercent * 100, 2)}%`);

  // _print(`\n\n`);
  // _print('========== USER STATS ==========');
  // // user stats
  // const tokenBalance =
  //   (await ERC20TOKEN.balanceOf(App.YOUR_ADDRESS)) / TOKEN_ADDR.denom; // erc20 token balance
  // const sealBalance = (await SEAL.balanceOf(App.YOUR_ADDRESS)) / 1e18; // seal token balance
  // const pairBalance = (await UNISWAP_PAIR.balanceOf(App.YOUR_ADDRESS)) / 1e18; // uniswap lp token balance, unstaked
  // _print(`${TOKEN_ADDR.tick} balance: ${tokenBalance}`);
  // _print(`SEAL balance: ${sealBalance}`);
  // _print(`unstaked LP token balance: ${pairBalance}`);
  // _print(`\n`);
  // const stakeTotal = (await STAKING_POOL.totalSupply()) / 1e18; // total share in stake unit
  // const userStake = (await STAKING_POOL.balanceOf(App.YOUR_ADDRESS)) / 1e18; // total share of user,
  // const totalValue = (await STAKING_POOL.totalValue()) / 1e18; // excluded expected amount
  // const userLPValue = (userStake * totalValue) / stakeTotal; // in unit of LP token

  // const userShare = userLPValue / totalLP;
  // const userShareWithFee = userShare * withdrawRate;
  // const userNetSeal = userShareWithFee * sealInUniPool;
  // const userNetToken = userShareWithFee * tokenInUniPool;
  // const userNetSealinUSD = userNetSeal * prices['seal-finance'].usd;
  // const userNetTokeninUSD = userNetToken * prices[TOKEN_ADDR.pricetick].usd;
  // const userNetWorth = toDollar(userNetSealinUSD + userNetTokeninUSD);

  // _print(`staked LP token: ${userStake}`);
  // _print(`farmed LP token: ${userLPValue - userStake}`);
  // _print(`net LP token (withdrawal fee excluded): ${userLPValue}`);
  // _print(
  //   `net LP token (withdrawal fee included) : ${userLPValue * withdrawRate}`
  // );
  // _print_bold(`value worth (withdrawal fee included): ${userNetWorth}`);

  // // const YFIWeeklyROI =
  // //   (rewardPerToken * rewardTokenPdrice * 100) / stakingTokenPrice;

  // // _print(`\nHourly ROI in USD : ${toFixed(YFIWeeklyROI / 7 / 24, 4)}%`);
  // // _print(`Daily ROI in USD  : ${toFixed(YFIWeeklyROI / 7, 4)}%`);
  // // _print(`Weekly ROI in USD : ${toFixed(YFIWeeklyROI, 4)}%`);
  // // _print(`APY (unstable)    : ${toFixed(YFIWeeklyROI * 52, 4)}% \n`);

  // // const timeTilHalving = nextHalving - Date.now() / 1000;

  // // if (timeTilHalving > 604800) {
  // //   _print(`Reward starting   : in ${forHumans(timeTilHalving - 604800)} \n`);
  // // } else {
  // //   _print(`Reward ending     : in ${forHumans(timeTilHalving)} \n`);
  // // }

  // // const approveTENDAndStake = async function () {
  // //   return rewardsContract_stake(stakingTokenAddr, rewardPoolAddr, App);
  // // };

  // // const unstake = async function () {
  // //   return rewardsContract_unstake(rewardPoolAddr, App);
  // // };

  // // const claim = async function () {
  // //   return rewardsContract_claim(rewardPoolAddr, App);
  // // };

  // // const exit = async function () {
  // //   return rewardsContract_exit(rewardPoolAddr, App);
  // // };

  // // _print_link(`Stake ${unstakedY} ${stakingTokenTicker}`, approveTENDAndStake);
  // // _print_link(`Unstake ${stakedYAmount} ${stakingTokenTicker}`, unstake);
  // // _print_link(`Claim ${earnedYFFI} ${rewardTokenTicker}`, claim);
  // // _print_link(`Exit`, exit);
  // _print(`\n\n\n\n Donation: 0x130A112A7Fc00C242841E9779f79fb4f0D662e61`);
  hideLoading();
}
