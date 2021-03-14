$(function () {
  consoleInit();
  start(main);
});

async function main() {
  const App = await init_ethers();

  const KEEP_TOKEN_ADDR = '0x85eee30c52b0b379b046fb0f85f4f3dc3009afec';
  const KEEP_STAKING = '0xdF00daC2Be1250cF62cBFc617EE7bC45C0016c87';

  // Keep Token In Vault Contract: 0xCf916681a6F08fa22e9EF3e665F2966Bf3089Ff1
  //App.YOUR_ADDRESS = '0xc82ef15f32ecf1079ad20d428a723fdffa2f1b20'; //a test address

  // input data

  const POOL_LP = KEEP_TOKEN_ADDR;
  const STAKE_ADDR = KEEP_STAKING;

  _print(`Initialized ${App.YOUR_ADDRESS}`);
  _print('Reading smart contracts...\n');
  _print(`KEEP vault address: ${STAKE_ADDR}`);
  _print(`\n\n`);

  ///

  const STAKING_POOL = new ethers.Contract(
    STAKE_ADDR,
    STAKING_POOL_ABI,
    App.provider
  );
  const KEEP_TOKEN = new ethers.Contract(POOL_LP, ERC20_ABI, App.provider);

  const prices = await lookUpPrices(['keep-network']);

  _print(`======= STAKING ==========`);
  const totalStaked = (await STAKING_POOL.totalStaked()) / 1e18;
  const stakeValue = totalStaked * prices['keep-network'].usd;
  const yourUnstakedLP = (await KEEP_TOKEN.balanceOf(App.YOUR_ADDRESS)) / 1e18;
  const yourStakedLP =
    (await STAKING_POOL.totalStakedFor(App.YOUR_ADDRESS)) / 1e18;
  const stakingPoolPercentage = yourStakedLP / totalStaked;
  const unstakingPoolPercentage = yourUnstakedLP / totalStaked;

  const totalUnlocked = (await STAKING_POOL.totalUnlocked()) / 1e18;
  console.log('totalUnlocked:', totalUnlocked);
  const unlockSchedules_data = await STAKING_POOL.unlockSchedules(0);
  const unlocked_share = unlockSchedules_data[1];
  // console.log('initial locked share', unlockSchedules_data[0] / 1e18);
  // console.log('unlocked share', unlockSchedules_data[1] / 1e18);
  // console.log('lastUnlockTimestampSec', unlockSchedules_data[2] / 1);
  // console.log('endAtSec', unlockSchedules_data[3] / 1);
  // console.log('durationSec', unlockSchedules_data[4] / 1);
  // stake bonus calculation

  _print(
    `There are total   : ${toFixed(
      totalStaked,
      2
    )} Keep token staked in the Vault.`
  );
  _print(`                  = ${toDollar(stakeValue)} \n`);
  _print(
    `You are staking   : ${yourStakedLP} KEEP (${toFixed(
      stakingPoolPercentage * 100,
      2
    )}% of the pool)`
  );
  _print(
    `                  = ${toDollar(
      toFixed(yourStakedLP * prices['keep-network'].usd, 2)
    )}`
  );
  _print(
    `Your wallet  : ${yourUnstakedLP} KEEP (${toFixed(
      unstakingPoolPercentage * 100,
      2
    )}% of the pool)`
  );
  _print(
    `                  = ${toDollar(
      yourUnstakedLP * prices['keep-network'].usd
    )} \n`
  );

  _print(`======= KEEP REWARDS ======`);
  // const earnedKEEP = (await STAKING_POOL.earned(App.YOUR_ADDRESS)) / 1e18;
  const monthlyKeepReward = (await unlocked_share) / 1e18;
  const keepRewardPerToken = monthlyKeepReward / totalStaked;
  // console.log(weeklyKeepReward);
  // // _print(`Claimable Rewards : ${earnedKEEP} KEEP`);
  // _print(
  //   `                  = ${toDollar(earnedKEEP * prices['keep-network'].usd)}\n`
  // );
  _print(
    `monthly estimate   : ${
      keepRewardPerToken * yourStakedLP
    } KEEP (out of total ${toFixed(monthlyKeepReward, 1)} KEEP)`
  );
  _print(
    `                  = ${toDollar(
      keepRewardPerToken * yourStakedLP * prices['keep-network'].usd
    )}`
  );
  const KeepMonthlyROI = keepRewardPerToken * 100;

  _print(`Monthly ROI in USD : ${toFixed(KeepMonthlyROI, 4)}%`);
  _print(`APR (unstable)    : ${toFixed(KeepMonthlyROI * 12, 4)}% \n`);

  // // add method to stake, unstake, harvest method
  // const stake = async function () {
  //   let amount = await SADDLE_LP_TOKEN.balanceOf(App.YOUR_ADDRESS);
  //   console.log(amount);
  //   return uni_stake(POOL_LP, STAKE_ADDR, amount, App);
  // };

  // const harvest = async function () {
  //   return uni_harvest(STAKE_ADDR, App);
  // };

  // const unstake = async function () {
  //   return uni_unstake(STAKE_ADDR, App);
  // };

  // _print(`\n\n`);
  // _print_link(`Stake your LP`, stake);
  // _print_link(`Unstake your LP`, unstake);
  // _print_link(`Harvest KEEP`, harvest);

  hideLoading();
}
