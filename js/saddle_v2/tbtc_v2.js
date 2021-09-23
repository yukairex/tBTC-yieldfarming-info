$(function () {
  consoleInit();
  start(main);
});

async function main() {
  const App = await init_ethers();

  const KEEP_TOKEN_ADDR = '0x85eee30c52b0b379b046fb0f85f4f3dc3009afec';

  // input data
  const POOL_ADDR = SADDLE_POOL;
  const POOL_LP = SADDLE_LP;
  const STAKE_ADDR = LP_STAKE;
  const PAIR_NAME = 'tBTC v2 POOL';

  _print(`Initialized ${App.YOUR_ADDRESS}`);
  _print('Reading smart contracts...\n');
  _print(`Saddle ${PAIR_NAME} address: ${POOL_ADDR}`);
  _print(`LP staking address: ${STAKE_ADDR}`);
  _print(`\n\n`);

  ///

  const STAKING_POOL = new ethers.Contract(
    STAKE_ADDR,
    STAKING_POOL_ABI,
    App.provider
  );

  const SADDLE_LP_TOKEN = new ethers.Contract(POOL_LP, ERC20_ABI, App.provider);

  const prices = await lookUpPrices(['keep-network', 'tbtc', 'bitcoin']);

  // find the total pool value:
  // var poolValue = 0;

  // BTC_TOKENS.forEach(async (token) => {
  //   console.log(token);
  //   let token_instance = new ethers.Contract(
  //     token.address,
  //     ERC20_ABI,
  //     App.provider
  //   );

  //   let amount = (await token_instance.balanceOf(POOL_ADDR)) / token.decimal;
  //   value = amount * prices[token.symbol].usd;
  //   console.log(token.name);
  //   console.log(amount);
  //   console.log(value);
  //   poolValue = poolValue + parseFloat(value);

  //   _print(`1 ${token.name} = $${prices[token.symbol].usd}`);
  // });

  // calculate LP token value

  _print(`======= STAKING ==========`);
  const totalLP = (await SADDLE_LP_TOKEN.totalSupply()) / 1e18;
  const poolValue = totalLP * prices['bitcoin'].usd;

  const stakedLP = (await SADDLE_LP_TOKEN.balanceOf(STAKE_ADDR)) / 1e18;
  const lpValuePerToken = poolValue / totalLP;
  console.log(poolValue);
  const yourUnstakedLP =
    (await SADDLE_LP_TOKEN.balanceOf(App.YOUR_ADDRESS)) / 1e18;
  const yourStakedLP = (await STAKING_POOL.balanceOf(App.YOUR_ADDRESS)) / 1e18;
  const stakingPoolPercentage = yourStakedLP / stakedLP;
  const unstakingPoolPercentage = yourUnstakedLP / stakedLP;

  _print(
    `There are total   : ${toFixed(totalLP, 6)} LP token in Saddle BTC Pool.`
  );
  _print(
    `There are total   : ${toFixed(
      stakedLP,
      6
    )} LP token staked in the KEEP staking contract.`
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

  // add method to stake, unstake, harvest method
  const stake = async function () {
    let amount = await SADDLE_LP_TOKEN.balanceOf(App.YOUR_ADDRESS);
    console.log(amount);
    return uni_stake(POOL_LP, STAKE_ADDR, amount, App);
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
