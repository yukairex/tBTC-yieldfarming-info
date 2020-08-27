$(function() {
    consoleInit();
    start(main);
});

async function main() {

    const stakingTokenAddr = PASTA_ETH_UNI_TOKEN_ADDR;
    const stakingTokenTicker = "UNIV2";
    const rewardPoolAddr = PASTA_ETH_REWARD_ADDR;
    const rewardTokenAddr = PASTAv2_TOKEN_ADDR;
    const rewardTokenTicker = "PASTA";

    const App = await init_ethers();

    _print(`Initialized ${App.YOUR_ADDRESS}`);
    _print("Reading smart contracts...\n");
    _print(`${rewardTokenTicker} Address: ${rewardTokenAddr}`);
    _print(`Reward Pool Address: ${rewardPoolAddr}\n`);

    const REWARD_POOL = new ethers.Contract(rewardPoolAddr, P_STAKING_POOL_ABI, App.provider);
    const STAKING_TOKEN = new ethers.Contract(stakingTokenAddr, ERC20_ABI, App.provider);
    const CURVE_Y_POOL = new ethers.Contract(CURVE_Y_POOL_ADDR, CURVE_Y_POOL_ABI, App.provider);
    const PASTA_TOKEN = new ethers.Contract(PASTA_TOKEN_ADDR, ERC20_ABI, App.provider);
    const WETH_TOKEN = new ethers.Contract(WETH_TOKEN_ADDR, ERC20_ABI, App.provider);
    const YEARN_VAULT_CONTROLLER = new ethers.Contract(YEARN_VAULT_CONTROLLER_ADDR, YEARN_VAULT_CONTROLLER_ABI, App.provider);
    const vaultAddress = await YEARN_VAULT_CONTROLLER.vaults(YCRV_TOKEN_ADDR);
    const vaultContract = new ethers.Contract(vaultAddress, YEARN_VAULT_ABI, App.provider);
    const currentPricePerFullShare = await vaultContract.getPricePerFullShare();

    const stakedYAmount = await REWARD_POOL.balanceOf(App.YOUR_ADDRESS) / 1e18;
    const earnedYFFI = await REWARD_POOL.earned(App.YOUR_ADDRESS) / 1e18;
    
    const totalSupplyOfStakingToken = await STAKING_TOKEN.totalSupply() / 1e18;
    const totalStakedYAmount = await STAKING_TOKEN.balanceOf(rewardPoolAddr) / 1e18;

    const totalWETHInUniswapPair = await WETH_TOKEN.balanceOf(PASTA_ETH_UNI_TOKEN_ADDR) / 1e18;
    const totalYAMInUniswapPair = await PASTA_TOKEN.balanceOf(PASTA_ETH_UNI_TOKEN_ADDR) / 1e18;

    // Find out reward rate
    const weekly_reward = await get_synth_weekly_rewards(REWARD_POOL) / 1e18;
    const nextHalving = await getPeriodFinishForReward(REWARD_POOL);

    const rewardPerToken = weekly_reward / totalStakedYAmount;

    // Find out underlying assets of Y
    const YVirtualPrice = await CURVE_Y_POOL.get_virtual_price() / 1e18;
    const YYVirtualPrice = (YVirtualPrice * currentPricePerFullShare) / 1e18
    const unstakedY = await STAKING_TOKEN.balanceOf(App.YOUR_ADDRESS) / 1e18;
    const prices = await lookUpPrices(["ethereum", "spaghetti"]);
    const stakingTokenPrice = (totalYAMInUniswapPair * prices["spaghetti"].usd + totalWETHInUniswapPair * prices["ethereum"].usd) / totalSupplyOfStakingToken;
    const rewardTokenPrice = prices["spaghetti"].usd;

    _print("========== PRICES ==========")
    _print(`1 ${rewardTokenTicker}    = $${rewardTokenPrice}`);
    _print(`1 ETH      = $${prices["ethereum"].usd}`);
    _print(`1 ${stakingTokenTicker}    = $${stakingTokenPrice}\n`);

    _print("========== STAKING =========")
    _print(`There are total   : ${totalSupplyOfStakingToken} ${stakingTokenTicker}.`);
    _print(`There are total   : ${totalStakedYAmount} ${stakingTokenTicker} staked in ${rewardTokenTicker}'s ${stakingTokenTicker} staking pool.`);
    _print(`                  = ${toDollar(totalStakedYAmount * stakingTokenPrice)}\n`);
    _print(`You are staking   : ${stakedYAmount} ${stakingTokenTicker} (${toFixed(stakedYAmount * 100 / totalStakedYAmount, 3)}% of the pool)`);
    _print(`                  = ${toDollar(stakedYAmount * stakingTokenPrice)}\n`);
    _print(`\n======== 🍝 ${rewardTokenTicker} REWARDS 🍝 ========`)
    _print(`Claimable Rewards : ${toFixed(earnedYFFI, 4)} ${rewardTokenTicker} = $${toFixed(earnedYFFI * rewardTokenPrice, 2)}`);
    const YFFIWeeklyEstimate = rewardPerToken * stakedYAmount;
    _print(`Hourly estimate   : ${toFixed(YFFIWeeklyEstimate / (24 * 7), 4)} ${rewardTokenTicker} = ${toDollar((YFFIWeeklyEstimate / (24 * 7)) * rewardTokenPrice)} (out of total ${toFixed(weekly_reward / (7 * 24), 2)} ${rewardTokenTicker})`)
    _print(`Daily estimate    : ${toFixed(YFFIWeeklyEstimate / 7, 2)} ${rewardTokenTicker} = ${toDollar((YFFIWeeklyEstimate / 7) * rewardTokenPrice)} (out of total ${toFixed(weekly_reward / 7, 2)} ${rewardTokenTicker})`)
    _print(`Weekly estimate   : ${toFixed(YFFIWeeklyEstimate, 2)} ${rewardTokenTicker} = ${toDollar(YFFIWeeklyEstimate * rewardTokenPrice)} (out of total ${weekly_reward} ${rewardTokenTicker})`)
    const YFIWeeklyROI = (rewardPerToken * rewardTokenPrice) * 100 / (stakingTokenPrice);
 
    _print(`\nHourly ROI in USD : ${toFixed((YFIWeeklyROI / 7) / 24, 4)}%`)
    _print(`Daily ROI in USD  : ${toFixed(YFIWeeklyROI / 7, 4)}%`)
    _print(`Weekly ROI in USD : ${toFixed(YFIWeeklyROI, 4)}%`)
    _print(`APY (unstable)    : ${toFixed(YFIWeeklyROI * 52, 4)}% \n`)

    const timeTilHalving = nextHalving - (Date.now() / 1000);

    if (timeTilHalving > 1814400) {
        _print(`Reward starting   : in ${forHumans(timeTilHalving - 1814400)} \n`);
    } else {
        _print(`Reward ending     : in ${forHumans(timeTilHalving)} \n`);
    }

    const resetApprove = async function() {
       return rewardsContract_resetApprove(stakingTokenAddr, rewardPoolAddr, App);
    };

    const approveTENDAndStake = async function () {
        return rewardsContract_stake(stakingTokenAddr, rewardPoolAddr, App);
    };

    const unstake = async function() {
        return rewardsContract_unstake(rewardPoolAddr, App);
    };

    const claim = async function() {
        return rewardsContract_claim(rewardPoolAddr, App);
    };

    const exit = async function() {
        return rewardsContract_exit(rewardPoolAddr, App);
    };

    _print_link(`Reset approval to 0`, resetApprove);
    _print_link(`Stake ${unstakedY} ${stakingTokenTicker}`, approveTENDAndStake);
    _print_link(`Unstake ${stakedYAmount} ${stakingTokenTicker}`, unstake);
    _print_link(`Claim ${earnedYFFI} ${rewardTokenTicker}`, claim);
    _print_link(`Exit`, exit);

    hideLoading();

}
