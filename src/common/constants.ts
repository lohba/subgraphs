import { BigDecimal, BigInt, Address } from "@graphprotocol/graph-ts";

////////////////////
///// Versions /////
////////////////////

export const PROTOCOL_NAME = "GYSR";
export const PROTOCOL_SLUG = "gysr";
export const PROTOCOL_SCHEMA_VERSION = "1.2.1";
export const PROTOCOL_SUBGRAPH_VERSION = "1.0.2";
export const PROTOCOL_METHODOLOGY_VERSION = "1.0.0";

////////////////////////
///// Schema Enums /////
////////////////////////

// GYSR Factory contract
export const PROTOCOL_ID = "0xCAda3423d33259A94C1ED1A7AEEcb73B87D0B684";

// The network names corresponding to the Network enum in the schema.
// They also correspond to the ones in `dataSource.network()` after converting to lower case.
// See below for a complete list:
// https://thegraph.com/docs/en/hosted-service/what-is-hosted-service/#supported-networks-on-the-hosted-service
export namespace Network {
  export const ARBITRUM_ONE = "ARBITRUM_ONE";
  export const AVALANCHE = "AVALANCHE";
  export const AURORA = "AURORA";
  export const BSC = "BSC"; // aka BNB Chain
  export const CELO = "CELO";
  export const MAINNET = "MAINNET"; // Ethereum mainnet
  export const FANTOM = "FANTOM";
  export const FUSE = "FUSE";
  export const MOONBEAM = "MOONBEAM";
  export const MOONRIVER = "MOONRIVER";
  export const NEAR_MAINNET = "NEAR_MAINNET";
  export const OPTIMISM = "OPTIMISM";
  export const MATIC = "MATIC"; // aka Polygon
  export const XDAI = "XDAI"; // aka Gnosis Chain
}

export namespace ProtocolType {
  export const EXCHANGE = "EXCHANGE";
  export const LENDING = "LENDING";
  export const YIELD = "YIELD";
  export const BRIDGE = "BRIDGE";
  export const GENERIC = "GENERIC";
}

export namespace VaultFeeType {
  export const MANAGEMENT_FEE = "MANAGEMENT_FEE";
  export const PERFORMANCE_FEE = "PERFORMANCE_FEE";
  export const DEPOSIT_FEE = "DEPOSIT_FEE";
  export const WITHDRAWAL_FEE = "WITHDRAWAL_FEE";
}

export namespace RewardTokenType {
  export const DEPOSIT = "DEPOSIT";
  export const BORROW = "BORROW";
}

export namespace Protocol {
  export const NAME = "Stake DAO";
  export const SLUG = "stake-dao";
  export const SCHEMA_VERSION = "1.2.1";
  export const SUBGRAPH_VERSION = "1.1.0";
  export const NETWORK = Network.MAINNET;
  export const TYPE = ProtocolType.YIELD;
}

//////////////////////////////
///// Ethereum Addresses /////
//////////////////////////////

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export const UNISWAP_V2_FACTORY = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

export const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
export const USDC_WETH_PAIR = "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc"; // created 10008355
export const DAI_WETH_PAIR = "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11"; // created block 10042267
export const USDT_WETH_PAIR = "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852"; // created block 10093341

////////////////////////
///// Type Helpers /////
////////////////////////

export const DEFAULT_DECIMALS = 18;

export const USDC_DECIMALS = 6;
export const USDC_DENOMINATOR = BigDecimal.fromString("1000000");

export const BIGINT_ZERO = BigInt.fromI32(0);
export const BIGINT_ONE = BigInt.fromI32(1);
export const BIGINT_TWO = BigInt.fromI32(2);
export const BIGINT_TEN = BigInt.fromI32(10);
export const BIGINT_HUNDRED = BigInt.fromI32(100);
export const BIGINT_THOUSAND = BigInt.fromI32(1000);
export const BIGINT_MAX = BigInt.fromString(
  "115792089237316195423570985008687907853269984665640564039457584007913129639935",
);

export const INT_NEGATIVE_ONE = -1 as i32;
export const INT_ZERO = 0 as i32;
export const INT_ONE = 1 as i32;
export const INT_TWO = 2 as i32;
export const INT_FOUR = 4 as i32;

export const DENOMINATOR = BigDecimal.fromString("10000");
export const BIGDECIMAL_ZERO = new BigDecimal(BIGINT_ZERO);
export const BIGDECIMAL_ONE = new BigDecimal(BIGINT_ONE);
export const BIGDECIMAL_TWO = new BigDecimal(BIGINT_TWO);
export const BIGDECIMAL_HUNDRED = BigDecimal.fromString("100");
export const MAX_UINT = BigInt.fromI32(2).times(BigInt.fromI32(255));

/////////////////////
///// Date/Time /////
/////////////////////

export const SECONDS_PER_DAY = 60 * 60 * 24; // 86400
export const SECONDS_PER_HOUR = 60 * 60; // 3600
export const MS_PER_DAY = new BigDecimal(BigInt.fromI32(24 * 60 * 60 * 1000));
export const DAYS_PER_YEAR = new BigDecimal(BigInt.fromI32(365));
export const MS_PER_YEAR = DAYS_PER_YEAR.times(new BigDecimal(BigInt.fromI32(24 * 60 * 60 * 1000)));

////////////////
///// Misc /////
////////////////

export const ETH_SYMBOL = "ETH"
export const ETH_NAME = "Ether"

/////////////////////////////
///// Protocol Specific /////
/////////////////////////////

// contract
export let INITIAL_SHARES_PER_TOKEN = BigDecimal.fromString('1000000');

// factories
export let ERC20_COMPETITIVE_REWARD_MODULE_FACTORIES: Address[] = [
  Address.fromString('0x4e06ae5fa48089a69d4ee4ffee9524b06c2b7400'),
  Address.fromString('0x180b934da7b529a1a158cA2c1C6306c568787761')
];
export let ERC20_FRIENDLY_REWARD_MODULE_FACTORIES: Address[] = [
  Address.fromString('0x101063f864e91b72a5ce06342afc7ea5d8515398'),
  Address.fromString('0xAB403b87cfF1075392E23eB31c8f7AB20E39e71E')
];
export let ERC20_STAKING_MODULE_FACTORIES: Address[] = [
  Address.fromString('0xaef2a7E4CbEB875475cFb1924867B9374569D894')
];
export let ERC721_STAKING_MODULE_FACTORIES: Address[] = [
  Address.fromString('0xa13edbc1ea1751c338e2528f7defd082357e2d1e')
];

export let STABLECOINS: string[] = [
  '{{usdc_address}}',
  '{{usdt_address}}',
  '{{dai_address}}',
  '{{frax_address}}'
];

export let STABLECOIN_DECIMALS: number[] = [6, 6, 18, 18];