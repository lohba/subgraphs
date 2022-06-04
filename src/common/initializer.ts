import {
  Token,
  Account,
  YieldAggregator,
  VaultDailySnapshot,
  VaultHourlySnapshot,
  FinancialsDailySnapshot,
  UsageMetricsDailySnapshot,
  UsageMetricsHourlySnapshot,
  Vault,
  RewardToken
} from "../generated/schema";
import * as utils from "./utils";
import * as constants from "./constants";
// import { enumToPrefix } from "./strings";
import { ActiveAccount, Vault as VaultStore } from "../generated/schema";
import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import { Pool as VaultContract } from "../generated/PoolFactory/Pool";
import { _ERC20 as ERC20Contract } from "../generated/PoolFactory/_ERC20";


export function getOrCreateAccount(id: string): Account {
  let account = Account.load(id);

  if (!account) {
    account = new Account(id);
    account.save();

    const protocol = getOrCreateYieldAggregator();
    protocol.cumulativeUniqueUsers += 1;
    protocol.save();
  }

  return account;
}
export function getOrCreateYieldAggregator(): YieldAggregator {
  const protocolId = constants.PROTOCOL_ID;
  let protocol = YieldAggregator.load(protocolId);

  if (!protocol) {
    protocol = new YieldAggregator(protocolId);
    protocol.name = constants.Protocol.NAME;
    protocol.slug = constants.Protocol.SLUG;
    protocol.schemaVersion = constants.Protocol.SCHEMA_VERSION;
    protocol.subgraphVersion = constants.Protocol.SUBGRAPH_VERSION;
    protocol.network = constants.Protocol.NETWORK;
    protocol.type = constants.Protocol.TYPE;

    protocol.save();
  }

  return protocol;
}

export function getOrCreateToken(address: Address): Token {
  let token = Token.load(address.toHexString());

  if (!token) {
    token = new Token(address.toHexString());

    const contract = ERC20Contract.bind(address);

    token.name = utils.readValue<string>(contract.try_name(), "");
    token.symbol = utils.readValue<string>(contract.try_symbol(), "");
    token.decimals = utils
      .readValue<BigInt>(contract.try_decimals(), constants.BIGINT_ZERO)
      .toI32() as u8;

    token.save();
  }

  return token;
}

export function getOrCreateRewardToken(address: Address): RewardToken {
  const rewardTokenId = address.toHexString();
  let rewardToken = RewardToken.load(rewardTokenId);

  if (!rewardToken) {
    rewardToken = new RewardToken(rewardTokenId);

    const token = getOrCreateToken(address);
    rewardToken.token = token.id;
    rewardToken.type = constants.RewardTokenType.DEPOSIT;

    rewardToken.save();
  }
  return rewardToken as RewardToken;
}

export function getOrCreateFinancialDailySnapshots(
  block: ethereum.Block
): FinancialsDailySnapshot {
  let id = block.timestamp.toI64() / constants.SECONDS_PER_DAY;
  let financialMetrics = FinancialsDailySnapshot.load(id.toString());

  if (!financialMetrics) {
    financialMetrics = new FinancialsDailySnapshot(id.toString());
    financialMetrics.protocol = constants.PROTOCOL_ID;

    financialMetrics.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
    financialMetrics.protocolControlledValueUSD = constants.BIGDECIMAL_ZERO;
    financialMetrics.dailySupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
    financialMetrics.cumulativeSupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
    financialMetrics.dailyProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
    financialMetrics.cumulativeProtocolSideRevenueUSD =
      constants.BIGDECIMAL_ZERO;

    financialMetrics.dailyTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
    financialMetrics.cumulativeTotalRevenueUSD = constants.BIGDECIMAL_ZERO;

    financialMetrics.blockNumber = block.number;
    financialMetrics.timestamp = block.timestamp;

    financialMetrics.save();
  }

  return financialMetrics;
}

export function getOrCreateUsageMetricsDailySnapshot(
  block: ethereum.Block
): UsageMetricsDailySnapshot {
  let id: i64 = block.timestamp.toI64() / constants.SECONDS_PER_DAY;
  let usageMetrics = UsageMetricsDailySnapshot.load(id.toString());

  if (!usageMetrics) {
    usageMetrics = new UsageMetricsDailySnapshot(id.toString());
    usageMetrics.protocol = constants.PROTOCOL_ID;

    usageMetrics.dailyActiveUsers = 0;
    usageMetrics.cumulativeUniqueUsers = 0;
    usageMetrics.dailyTransactionCount = 0;
    usageMetrics.dailyDepositCount = 0;
    usageMetrics.dailyWithdrawCount = 0;

    usageMetrics.blockNumber = block.number;
    usageMetrics.timestamp = block.timestamp;

    usageMetrics.save();
  }

  return usageMetrics;
}

export function getOrCreateUsageMetricsHourlySnapshot(
  block: ethereum.Block
): UsageMetricsHourlySnapshot {
  let metricsID: string = (block.timestamp.toI64() / constants.SECONDS_PER_DAY)
    .toString()
    .concat("-")
    .concat((block.timestamp.toI64() / constants.SECONDS_PER_HOUR).toString());
  let usageMetrics = UsageMetricsHourlySnapshot.load(metricsID);

  if (!usageMetrics) {
    usageMetrics = new UsageMetricsHourlySnapshot(metricsID);
    usageMetrics.protocol = constants.PROTOCOL_ID;

    usageMetrics.hourlyActiveUsers = 0;
    usageMetrics.cumulativeUniqueUsers = 0;
    usageMetrics.hourlyTransactionCount = 0;
    usageMetrics.hourlyDepositCount = 0;
    usageMetrics.hourlyWithdrawCount = 0;

    usageMetrics.blockNumber = block.number;
    usageMetrics.timestamp = block.timestamp;

    usageMetrics.save();
  }

  return usageMetrics;
}

export function getOrCreateVaultsDailySnapshots(
  vaultAddress: Address,
  block: ethereum.Block
): VaultDailySnapshot {
  let id: string = vaultAddress
    .toHexString()
    .concat((block.timestamp.toI64() / constants.SECONDS_PER_DAY).toString());
  let vaultSnapshots = VaultDailySnapshot.load(id);

  if (!vaultSnapshots) {
    vaultSnapshots = new VaultDailySnapshot(id);
    vaultSnapshots.protocol = constants.PROTOCOL_ID;
    vaultSnapshots.vault = vaultAddress.toHexString();

    vaultSnapshots.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
    vaultSnapshots.inputTokenBalance = constants.BIGINT_ZERO;
    vaultSnapshots.outputTokenSupply = constants.BIGINT_ZERO;
    vaultSnapshots.outputTokenPriceUSD = constants.BIGDECIMAL_ZERO;
    vaultSnapshots.pricePerShare = constants.BIGDECIMAL_ZERO;
    vaultSnapshots.stakedOutputTokenAmount = constants.BIGINT_ZERO;
    vaultSnapshots.rewardTokenEmissionsAmount = [constants.BIGINT_ZERO];
    vaultSnapshots.rewardTokenEmissionsUSD = [constants.BIGDECIMAL_ZERO];

    vaultSnapshots.blockNumber = block.number;
    vaultSnapshots.timestamp = block.timestamp;

    vaultSnapshots.save();
  }

  return vaultSnapshots;
}

export function getOrCreateVaultsHourlySnapshots(
  vaultAddress: Address,
  block: ethereum.Block
): VaultHourlySnapshot {
  let id: string = vaultAddress
    .toHexString()
    .concat((block.timestamp.toI64() / constants.SECONDS_PER_DAY).toString())
    .concat("-")
    .concat((block.timestamp.toI64() / constants.SECONDS_PER_HOUR).toString());
  let vaultSnapshots = VaultHourlySnapshot.load(id);

  if (!vaultSnapshots) {
    vaultSnapshots = new VaultHourlySnapshot(id);
    vaultSnapshots.protocol = constants.PROTOCOL_ID;
    vaultSnapshots.vault = vaultAddress.toHexString();

    vaultSnapshots.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
    vaultSnapshots.inputTokenBalance = constants.BIGINT_ZERO;
    vaultSnapshots.outputTokenSupply = constants.BIGINT_ZERO;
    vaultSnapshots.outputTokenPriceUSD = constants.BIGDECIMAL_ZERO;
    vaultSnapshots.pricePerShare = constants.BIGDECIMAL_ZERO;
    vaultSnapshots.stakedOutputTokenAmount = constants.BIGINT_ZERO;
    vaultSnapshots.rewardTokenEmissionsAmount = [constants.BIGINT_ZERO];
    vaultSnapshots.rewardTokenEmissionsUSD = [constants.BIGDECIMAL_ZERO];

    vaultSnapshots.blockNumber = block.number;
    vaultSnapshots.timestamp = block.timestamp;

    vaultSnapshots.save();
  }

  return vaultSnapshots;
}

// export function getOrCreateVault(
//   vaultAddress: Address,
//   block: ethereum.Block
// ): VaultStore {
//   const vaultAddressString = vaultAddress.toHexString();
//   const vaultContract = VaultContract.bind(vaultAddress);

//   let vault = VaultStore.load(vaultAddressString);

//   if (!vault) {
//     vault = new VaultStore(vaultAddressString);

//     //vault.name = utils.readValue<string>(vaultContract.try_name(), "");
//     //vault.symbol = utils.readValue<string>(vaultContract.try_symbol(), "");
//     vault.protocol = constants.PROTOCOL_ID;
//     vault.depositLimit = utils.readValue<BigInt>(
//       vaultContract.try_depositLimit(),
//       constants.BIGINT_ZERO
//     );

//     const inputToken = getOrCreateToken(vaultContract.token());
//     vault.inputToken = inputToken.id;
//     vault.inputTokenBalance = constants.BIGINT_ZERO;

//     const outputToken = getOrCreateToken(vaultAddress);
//     vault.outputToken = outputToken.id;
//     vault.outputTokenSupply = constants.BIGINT_ZERO;

//     vault.outputTokenPriceUSD = constants.BIGDECIMAL_ZERO;
//     vault.pricePerShare = constants.BIGDECIMAL_ZERO;

//     vault.createdBlockNumber = block.number;
//     vault.createdTimestamp = block.timestamp;

//     vault.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;

//     const managementFeeId =
//       enumToPrefix(constants.VaultFeeType.MANAGEMENT_FEE) +
//       vaultAddress.toHexString();
//     let managementFee = utils.readValue<BigInt>(
//       vaultContract.try_managementFee(),
//       constants.DEFAULT_MANAGEMENT_FEE
//     );
//     utils.createFeeType(
//       managementFeeId,
//       constants.VaultFeeType.MANAGEMENT_FEE,
//       managementFee
//     );

//     const performanceFeeId =
//       enumToPrefix(constants.VaultFeeType.PERFORMANCE_FEE) +
//       vaultAddress.toHexString();
//     let performanceFee = utils.readValue<BigInt>(
//       vaultContract.try_performanceFee(),
//       constants.DEFAULT_PERFORMANCE_FEE
//     );
//     utils.createFeeType(
//       performanceFeeId,
//       constants.VaultFeeType.PERFORMANCE_FEE,
//       performanceFee
//     );

//     vault.fees = [managementFeeId, performanceFeeId];
//     vault.save();
//   }

//   return vault;
// }



export function updatePoolDayData(vault: Vault, timestamp: number): VaultDailySnapshot {
  let day = Math.floor(timestamp / 86400) as i32;
  let dayStartTimestamp = day * 86400; // will be 12:00am UTC due to rounding
  let id = vault.id + '_' + day.toString();

  let poolDayData = VaultDailySnapshot.load(id);  
    poolDayData = new VaultDailySnapshot(id);
    poolDayData.id = vault.id;
    poolDayData.inputTokenBalance = vault.inputTokenBalance;
    poolDayData.outputTokenSupply = <BigInt> vault.outputTokenSupply;
    poolDayData.pricePerShare = vault.pricePerShare;
    poolDayData.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
  return poolDayData;
}

// export function updatePlatform(platform: YieldAggregator, timestamp: BigInt, skip: Vault): boolean {
//   // skip if pricing period has not elapsed
//   if (timestamp.minus(platform._updated).lt(PRICING_PERIOD)) {
//     return false;
//   }

//   let pools = platform._activePools;
//   var stale: string[] = [];

//   log.info(
//     'Running platform pricing update... ts: {}, pools: {}',
//     [timestamp.toString(), BigInt.fromI32(pools.length).toString()]
//   );

//   for (let i = 0; i < pools.length; i++) {
//     // don't need to price pool that triggered this event
//     if (pools[i] == skip.id) {
//       continue;
//     }

//     // load
//     let pool = Pool.load(pools[i])!;
//     let stakingToken = Token.load(pool.stakingToken)!;
//     let rewardToken = Token.load(pool.rewardToken)!;

//     // update pool
//     if (pool.stakingModuleType == 'V1') {
//       let contract = GeyserContractV1.bind(Address.fromString(pool.id));
//       updateGeyserV1(pool, platform, contract, stakingToken, rewardToken, timestamp);
//     } else {
//       updatePool(pool, platform, stakingToken, rewardToken, timestamp);
//     }

//     // update pool day snapshot
//     let poolDayData = updatePoolDayData(pool, timestamp.toI32());

//     // store
//     pool.save();
//     stakingToken.save();
//     rewardToken.save();
//     poolDayData.save();

//     // remove low TVL pools from priced list
//     // note: no longer removing "stale" pools to support use cases with recurring zero duration funding
//     if (pool.tvl.lt(PRICING_MIN_TVL)) {
//       stale.push(pool.id);
//       log.info('Removing low TVL pool from active pricing {} ({})', [pool.id.toString(), timestamp.toString()]);
//     }
//   }

//   if (stale.length) {
//     let filtered: string[] = [];
//     for (let i = 0; i < pools.length; i++) {
//       if (stale.includes(pools[i])) continue
//       filtered.push(pools[i]);
//     }
//     platform._activePools = filtered;
//   }
//   platform._updated = timestamp;
//   return true;
// }