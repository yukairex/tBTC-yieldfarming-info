// TOKENS
const KEEP_TOKEN_ADDR = '0x85eee30c52b0b379b046fb0f85f4f3dc3009afec';
const TBTC_TOKEN_ADDR = '0x8daebade922df735c38c80c7ebd708af50815faa';
const WBTC_TOKEN_ADDR = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';
const SUSHI_TOKEN_ADDR = '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2';

const TBTC_CRV_METAPOOL_LP_TOKEN = '0x64eda51d3Ad40D56b9dFc5554E06F94e1Dd786Fd';
const SBTC_CRV_BASEPOOL_LP_TOKEN = '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3';

// contracts
const TBTC_CRV_POOL = '0xaa82ca713D94bBA7A89CEAB55314F9EfFEdDc78c'; // deposit address
const TBTC_SUSHI_POOL = '';
const TBTC_CRV_GAUGE = '0x6828bcF74279eE32f2723eC536c22c51Eed383C6';

// ABIs:

// CRV_METAPOOL_ABI: CRV METAPOOL Deposit contract

const CRV_METAPOOL_ABI = [
  {
    outputs: [],
    inputs: [
      { type: 'address', name: '_pool' },
      { type: 'address', name: '_token' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    name: 'add_liquidity',
    outputs: [{ type: 'uint256', name: '' }],
    inputs: [
      { type: 'uint256[4]', name: 'amounts' },
      { type: 'uint256', name: 'min_mint_amount' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
    gas: 31141,
  },
  {
    name: 'remove_liquidity',
    outputs: [{ type: 'uint256[4]', name: '' }],
    inputs: [
      { type: 'uint256', name: '_amount' },
      { type: 'uint256[4]', name: 'min_amounts' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
    gas: 32919,
  },
  {
    name: 'remove_liquidity_one_coin',
    outputs: [{ type: 'uint256', name: '' }],
    inputs: [
      { type: 'uint256', name: '_token_amount' },
      { type: 'int128', name: 'i' },
      { type: 'uint256', name: '_min_amount' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
    gas: 14467,
  },
  {
    name: 'remove_liquidity_imbalance',
    outputs: [{ type: 'uint256', name: '' }],
    inputs: [
      { type: 'uint256[4]', name: 'amounts' },
      { type: 'uint256', name: 'max_burn_amount' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
    gas: 38200,
  },
  {
    name: 'calc_withdraw_one_coin',
    outputs: [{ type: 'uint256', name: '' }],
    inputs: [
      { type: 'uint256', name: '_token_amount' },
      { type: 'int128', name: 'i' },
    ],
    stateMutability: 'view',
    type: 'function',
    gas: 3147,
  },
  {
    name: 'calc_token_amount',
    outputs: [{ type: 'uint256', name: '' }],
    inputs: [
      { type: 'uint256[4]', name: 'amounts' },
      { type: 'bool', name: 'is_deposit' },
    ],
    stateMutability: 'view',
    type: 'function',
    gas: 4414,
  },
  {
    name: 'pool',
    outputs: [{ type: 'address', name: '' }],
    inputs: [],
    stateMutability: 'view',
    type: 'function',
    gas: 1241,
  },
  {
    name: 'token',
    outputs: [{ type: 'address', name: '' }],
    inputs: [],
    stateMutability: 'view',
    type: 'function',
    gas: 1271,
  },
  {
    name: 'base_pool',
    outputs: [{ type: 'address', name: '' }],
    inputs: [],
    stateMutability: 'view',
    type: 'function',
    gas: 1301,
  },
  {
    name: 'coins',
    outputs: [{ type: 'address', name: '' }],
    inputs: [{ type: 'uint256', name: 'arg0' }],
    stateMutability: 'view',
    type: 'function',
    gas: 1440,
  },
  {
    name: 'base_coins',
    outputs: [{ type: 'address', name: '' }],
    inputs: [{ type: 'uint256', name: 'arg0' }],
    stateMutability: 'view',
    type: 'function',
    gas: 1470,
  },
];

const STAKING_ABI = [
  {
    name: 'Deposit',
    inputs: [
      { type: 'address', name: 'provider', indexed: true },
      { type: 'uint256', name: 'value', indexed: false },
    ],
    anonymous: false,
    type: 'event',
  },
  {
    name: 'Withdraw',
    inputs: [
      { type: 'address', name: 'provider', indexed: true },
      { type: 'uint256', name: 'value', indexed: false },
    ],
    anonymous: false,
    type: 'event',
  },
  {
    name: 'UpdateLiquidityLimit',
    inputs: [
      { type: 'address', name: 'user', indexed: false },
      { type: 'uint256', name: 'original_balance', indexed: false },
      { type: 'uint256', name: 'original_supply', indexed: false },
      { type: 'uint256', name: 'working_balance', indexed: false },
      { type: 'uint256', name: 'working_supply', indexed: false },
    ],
    anonymous: false,
    type: 'event',
  },
  {
    name: 'CommitOwnership',
    inputs: [{ type: 'address', name: 'admin', indexed: false }],
    anonymous: false,
    type: 'event',
  },
  {
    name: 'ApplyOwnership',
    inputs: [{ type: 'address', name: 'admin', indexed: false }],
    anonymous: false,
    type: 'event',
  },
  {
    outputs: [],
    inputs: [
      { type: 'address', name: 'lp_addr' },
      { type: 'address', name: '_minter' },
      { type: 'address', name: '_reward_contract' },
      { type: 'address', name: '_rewarded_token' },
      { type: 'address', name: '_admin' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    name: 'user_checkpoint',
    outputs: [{ type: 'bool', name: '' }],
    inputs: [{ type: 'address', name: 'addr' }],
    stateMutability: 'nonpayable',
    type: 'function',
    gas: 2312845,
  },
  {
    name: 'claimable_tokens',
    outputs: [{ type: 'uint256', name: '' }],
    inputs: [{ type: 'address', name: 'addr' }],
    stateMutability: 'nonpayable',
    type: 'function',
    gas: 2231999,
  },
  {
    name: 'claimable_reward',
    outputs: [{ type: 'uint256', name: '' }],
    inputs: [{ type: 'address', name: 'addr' }],
    stateMutability: 'view',
    type: 'function',
    gas: 73000,
  },
  {
    name: 'kick',
    outputs: [],
    inputs: [{ type: 'address', name: 'addr' }],
    stateMutability: 'nonpayable',
    type: 'function',
    gas: 2318244,
  },
  {
    name: 'set_approve_deposit',
    outputs: [],
    inputs: [
      { type: 'address', name: 'addr' },
      { type: 'bool', name: 'can_deposit' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
    gas: 35826,
  },
  {
    name: 'deposit',
    outputs: [],
    inputs: [{ type: 'uint256', name: '_value' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    name: 'deposit',
    outputs: [],
    inputs: [
      { type: 'uint256', name: '_value' },
      { type: 'address', name: 'addr' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    name: 'withdraw',
    outputs: [],
    inputs: [{ type: 'uint256', name: '_value' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    name: 'withdraw',
    outputs: [],
    inputs: [
      { type: 'uint256', name: '_value' },
      { type: 'bool', name: 'claim_rewards' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    name: 'claim_rewards',
    outputs: [],
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    name: 'claim_rewards',
    outputs: [],
    inputs: [{ type: 'address', name: 'addr' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    name: 'integrate_checkpoint',
    outputs: [{ type: 'uint256', name: '' }],
    inputs: [],
    stateMutability: 'view',
    type: 'function',
    gas: 2387,
  },
  {
    name: 'kill_me',
    outputs: [],
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
    gas: 37368,
  },
  {
    name: 'commit_transfer_ownership',
    outputs: [],
    inputs: [{ type: 'address', name: 'addr' }],
    stateMutability: 'nonpayable',
    type: 'function',
    gas: 37987,
  },
  {
    name: 'apply_transfer_ownership',
    outputs: [],
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
    gas: 38887,
  },
  {
    name: 'minter',
    outputs: [{ type: 'address', name: '' }],
    inputs: [],
    stateMutability: 'view',
    type: 'function',
    gas: 1601,
  },
  {
    name: 'crv_token',
    outputs: [{ type: 'address', name: '' }],
    inputs: [],
    stateMutability: 'view',
    type: 'function',
    gas: 1631,
  },
  {
    name: 'lp_token',
    outputs: [{ type: 'address', name: '' }],
    inputs: [],
    stateMutability: 'view',
    type: 'function',
    gas: 1661,
  },
  {
    name: 'controller',
    outputs: [{ type: 'address', name: '' }],
    inputs: [],
    stateMutability: 'view',
    type: 'function',
    gas: 1691,
  },
  {
    name: 'voting_escrow',
    outputs: [{ type: 'address', name: '' }],
    inputs: [],
    stateMutability: 'view',
    type: 'function',
    gas: 1721,
  },
  {
    name: 'balanceOf',
    outputs: [{ type: 'uint256', name: '' }],
    inputs: [{ type: 'address', name: 'arg0' }],
    stateMutability: 'view',
    type: 'function',
    gas: 1905,
  },
  {
    name: 'totalSupply',
    outputs: [{ type: 'uint256', name: '' }],
    inputs: [],
    stateMutability: 'view',
    type: 'function',
    gas: 1781,
  },
  {
    name: 'future_epoch_time',
    outputs: [{ type: 'uint256', name: '' }],
    inputs: [],
    stateMutability: 'view',
    type: 'function',
    gas: 1811,
  },
  {
    name: 'approved_to_deposit',
    outputs: [{ type: 'bool', name: '' }],
    inputs: [
      { type: 'address', name: 'arg0' },
      { type: 'address', name: 'arg1' },
    ],
    stateMutability: 'view',
    type: 'function',
    gas: 2149,
  },
  {
    name: 'working_balances',
    outputs: [{ type: 'uint256', name: '' }],
    inputs: [{ type: 'address', name: 'arg0' }],
    stateMutability: 'view',
    type: 'function',
    gas: 2025,
  },
  {
    name: 'working_supply',
    outputs: [{ type: 'uint256', name: '' }],
    inputs: [],
    stateMutability: 'view',
    type: 'function',
    gas: 1901,
  },
  {
    name: 'period',
    outputs: [{ type: 'int128', name: '' }],
    inputs: [],
    stateMutability: 'view',
    type: 'function',
    gas: 1931,
  },
  {
    name: 'period_timestamp',
    outputs: [{ type: 'uint256', name: '' }],
    inputs: [{ type: 'uint256', name: 'arg0' }],
    stateMutability: 'view',
    type: 'function',
    gas: 2070,
  },
  {
    name: 'integrate_inv_supply',
    outputs: [{ type: 'uint256', name: '' }],
    inputs: [{ type: 'uint256', name: 'arg0' }],
    stateMutability: 'view',
    type: 'function',
    gas: 2100,
  },
  {
    name: 'integrate_inv_supply_of',
    outputs: [{ type: 'uint256', name: '' }],
    inputs: [{ type: 'address', name: 'arg0' }],
    stateMutability: 'view',
    type: 'function',
    gas: 2175,
  },
  {
    name: 'integrate_checkpoint_of',
    outputs: [{ type: 'uint256', name: '' }],
    inputs: [{ type: 'address', name: 'arg0' }],
    stateMutability: 'view',
    type: 'function',
    gas: 2205,
  },
  {
    name: 'integrate_fraction',
    outputs: [{ type: 'uint256', name: '' }],
    inputs: [{ type: 'address', name: 'arg0' }],
    stateMutability: 'view',
    type: 'function',
    gas: 2235,
  },
  {
    name: 'inflation_rate',
    outputs: [{ type: 'uint256', name: '' }],
    inputs: [],
    stateMutability: 'view',
    type: 'function',
    gas: 2111,
  },
  {
    name: 'reward_contract',
    outputs: [{ type: 'address', name: '' }],
    inputs: [],
    stateMutability: 'view',
    type: 'function',
    gas: 2141,
  },
  {
    name: 'rewarded_token',
    outputs: [{ type: 'address', name: '' }],
    inputs: [],
    stateMutability: 'view',
    type: 'function',
    gas: 2171,
  },
  {
    name: 'reward_integral',
    outputs: [{ type: 'uint256', name: '' }],
    inputs: [],
    stateMutability: 'view',
    type: 'function',
    gas: 2201,
  },
  {
    name: 'reward_integral_for',
    outputs: [{ type: 'uint256', name: '' }],
    inputs: [{ type: 'address', name: 'arg0' }],
    stateMutability: 'view',
    type: 'function',
    gas: 2385,
  },
  {
    name: 'rewards_for',
    outputs: [{ type: 'uint256', name: '' }],
    inputs: [{ type: 'address', name: 'arg0' }],
    stateMutability: 'view',
    type: 'function',
    gas: 2415,
  },
  {
    name: 'claimed_rewards_for',
    outputs: [{ type: 'uint256', name: '' }],
    inputs: [{ type: 'address', name: 'arg0' }],
    stateMutability: 'view',
    type: 'function',
    gas: 2445,
  },
  {
    name: 'admin',
    outputs: [{ type: 'address', name: '' }],
    inputs: [],
    stateMutability: 'view',
    type: 'function',
    gas: 2321,
  },
  {
    name: 'future_admin',
    outputs: [{ type: 'address', name: '' }],
    inputs: [],
    stateMutability: 'view',
    type: 'function',
    gas: 2351,
  },
  {
    name: 'is_killed',
    outputs: [{ type: 'bool', name: '' }],
    inputs: [],
    stateMutability: 'view',
    type: 'function',
    gas: 2381,
  },
];

// UTIL
const ERC20_ABI = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_from', type: 'address' },
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  { payable: true, stateMutability: 'payable', type: 'fallback' },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'owner', type: 'address' },
      { indexed: true, name: 'spender', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' },
    ],
    name: 'Transfer',
    type: 'event',
  },
];
const BLOCK_TIME = 13.4581790123457;
const e18 = BigInt('1000000000000000000');
