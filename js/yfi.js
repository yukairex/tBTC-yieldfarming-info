$(function () {
  consoleInit();
  start(main);
});

async function main() {
  print_warning();

  const TOKEN_ADDR = YFI_ADDR;

  const App = await init_ethers();

  _print(`Initialized ${App.YOUR_ADDRESS}`);
  _print('Reading smart contracts...\n');
  _print(`${TOKEN_ADDR.tick} Address: ${TOKEN_ADDR.token}`);
  _print(`Uniswap Pool Address: ${TOKEN_ADDR.pair}`);
  _print(`Farm Staking Address: ${TOKEN_ADDR.stake}`);
  _print(`\n\n`);

  const STAKING_POOL = new ethers.Contract(
    TOKEN_ADDR.stake,
    STAKING_POOL_ABI,
    App.provider
  );
  const ERC20TOKEN = new ethers.Contract(
    TOKEN_ADDR.token,
    ERC20_ABI,
    App.provider
  );

  const UNISWAP_PAIR = new ethers.Contract(
    TOKEN_ADDR.pair,
    UNISWAP_V2_PAIR_ABI,
    App.provider
  );

  const SEAL = new ethers.Contract(SEAL_ADDR, ERC20_ABI, App.provider);

  //  uniswap pool stats
  _print(`=======SEAL-${TOKEN_ADDR.tick} POOL ==========`);
  const tokenInUniPool =
    (await ERC20TOKEN.balanceOf(TOKEN_ADDR.pair)) / TOKEN_ADDR.denom;
  const sealInUniPool = (await SEAL.balanceOf(TOKEN_ADDR.pair)) / 1e18;
  const prices = await lookUpPrices([
    TOKEN_ADDR.pricetick,
    'seal-finance',
    'ethereum',
  ]);
  console.log(prices);
  // const stakingTokenPrice = prices['compound-governance-token'].usd;
  // const rewardTokenPrice = prices['spaghetti'].usd;
  _print(`1 ${TOKEN_ADDR.tick}  = $${prices[TOKEN_ADDR.pricetick].usd}`);
  _print(`1 SEAL  = $${prices[`seal-finance`].usd}`);
  _print(
    `${TOKEN_ADDR.tick} in pair: ${tokenInUniPool}, worth: ${toDollar(
      tokenInUniPool * prices[TOKEN_ADDR.pricetick].usd
    )} `
  );
  _print(
    `SEAL in pair: ${sealInUniPool}, worth: ${toDollar(
      sealInUniPool * prices['seal-finance'].usd
    )} `
  );

  _print(`\n\n`);
  _print('========== USER STATS ==========');
  // user stats
  const tokenBalance =
    (await ERC20TOKEN.balanceOf(App.YOUR_ADDRESS)) / TOKEN_ADDR.denom; // erc20 token balance
  const sealBalance = (await SEAL.balanceOf(App.YOUR_ADDRESS)) / 1e18; // seal token balance
  const pairBalance = (await UNISWAP_PAIR.balanceOf(App.YOUR_ADDRESS)) / 1e18; // uniswap lp token balance, unstaked
  _print(`${TOKEN_ADDR.tick} balance: ${tokenBalance}`);
  _print(`SEAL balance: ${sealBalance}`);
  _print(`unstaked LP token balance: ${pairBalance}`);

  const stakeTotal = (await STAKING_POOL.totalSupply()) / 1e18; // total share in stake unit
  const userStake = (await STAKING_POOL.balanceOf(App.YOUR_ADDRESS)) / 1e18; // total share of user,
  const totalValue = (await STAKING_POOL.totalValue()) / 1e18; // excluded expected amount
  const userLPValue = (userStake * totalValue) / stakeTotal; // in unit of LP token
  const totalLP = (await UNISWAP_PAIR.totalSupply()) / 1e18;

  const userShare = userLPValue / totalLP;
  const userShareWithFee = userShare * 0.95;
  const userNetSeal = userShareWithFee * sealInUniPool;
  const userNetToken = userShareWithFee * tokenInUniPool;
  const userNetSealinUSD = userNetSeal * prices['seal-finance'].usd;
  const userNetTokeninUSD = userNetToken * prices[TOKEN_ADDR.pricetick].usd;

  const userNetWorth = toDollar(userNetSealinUSD + userNetTokeninUSD);

  _print(`staked lp token: ${userStake}`);
  _print(`net lp token (withdrawal fee excluded): ${userLPValue}`);
  _print(`net lp token (withdrawal fee included) : ${userLPValue * 0.95}`);
  _print(`value worth (withdrawal fee included): ${userNetWorth}`);

  // const YFIWeeklyROI =
  //   (rewardPerToken * rewardTokenPrice * 100) / stakingTokenPrice;

  // _print(`\nHourly ROI in USD : ${toFixed(YFIWeeklyROI / 7 / 24, 4)}%`);
  // _print(`Daily ROI in USD  : ${toFixed(YFIWeeklyROI / 7, 4)}%`);
  // _print(`Weekly ROI in USD : ${toFixed(YFIWeeklyROI, 4)}%`);
  // _print(`APY (unstable)    : ${toFixed(YFIWeeklyROI * 52, 4)}% \n`);

  // const timeTilHalving = nextHalving - Date.now() / 1000;

  // if (timeTilHalving > 604800) {
  //   _print(`Reward starting   : in ${forHumans(timeTilHalving - 604800)} \n`);
  // } else {
  //   _print(`Reward ending     : in ${forHumans(timeTilHalving)} \n`);
  // }

  // const approveTENDAndStake = async function () {
  //   return rewardsContract_stake(stakingTokenAddr, rewardPoolAddr, App);
  // };

  // const unstake = async function () {
  //   return rewardsContract_unstake(rewardPoolAddr, App);
  // };

  // const claim = async function () {
  //   return rewardsContract_claim(rewardPoolAddr, App);
  // };

  // const exit = async function () {
  //   return rewardsContract_exit(rewardPoolAddr, App);
  // };

  // _print_link(`Stake ${unstakedY} ${stakingTokenTicker}`, approveTENDAndStake);
  // _print_link(`Unstake ${stakedYAmount} ${stakingTokenTicker}`, unstake);
  // _print_link(`Claim ${earnedYFFI} ${rewardTokenTicker}`, claim);
  // _print_link(`Exit`, exit);

  hideLoading();
}
