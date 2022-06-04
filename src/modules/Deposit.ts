import {
    Token,
    Vault as VaultStore,
    Deposit as DepositTransaction,
  } from "../generated/schema";
  import {
    log,
    BigInt,
    Address,
    ethereum,
    BigDecimal,
  } from "@graphprotocol/graph-ts";
  import {
    getOrCreateYieldAggregator,
    getOrCreateUsageMetricsDailySnapshot,
    getOrCreateUsageMetricsHourlySnapshot,
  } from "../common/initializer";
  import * as utils from "../common/utils";
  import { getUsdPricePerToken } from "../Prices";
  import { getPriceOfOutputTokens } from "./Price";
  import * as constants from "../common/constants";
  import { Pool as VaultContract } from "../generated/PoolFactory/Pool";
  import {BIGINT_ZERO} from '../common/constants';
  
  export function createDepositTransaction(
    to: Address,
    vaultAddress: Address,
    transaction: ethereum.Transaction,
    block: ethereum.Block,
    assetId: string,
    amount: BigInt,
    amountUSD: BigDecimal
  ): DepositTransaction {
    let transactionId = "deposit-" + transaction.hash.toHexString();
  
    let depositTransaction = DepositTransaction.load(transactionId);
  
    if (!depositTransaction) {
      depositTransaction = new DepositTransaction(transactionId);
  
      depositTransaction.vault = vaultAddress.toHexString();
      depositTransaction.protocol = constants.PROTOCOL_ID;
  
      depositTransaction.to = to.toHexString();
      depositTransaction.from = transaction.from.toHexString();
  
      depositTransaction.hash = transaction.hash.toHexString();
      depositTransaction.logIndex = transaction.index.toI32();
  
      depositTransaction.asset = assetId;
      depositTransaction.amount = amount;
      depositTransaction.amountUSD = amountUSD;
  
      depositTransaction.timestamp = utils.getTimestampInMillis(block);
      depositTransaction.blockNumber = block.number;
  
      depositTransaction.save();
    }
  
    return depositTransaction;
  }

  
  // export function _Deposit(
  //   to: Address,
  //   transaction: ethereum.Transaction,
  //   block: ethereum.Block,
  //   vault: VaultStore,
  //   depositAmount: BigInt,
  //   minted: BigInt
  // ): void {
  //   const vaultAddress = Address.fromString(vault.id);
  //   const vaultContract = VaultContract.bind(vaultAddress);
  //   const protocol = getOrCreateYieldAggregator();

  //   // calculate shares minted as per the deposit function in vault contract address
  //   let sharesMinted = minted;
    
  //   let inputToken = Token.load(vault.inputToken);
  //   let inputTokenAddress = Address.fromString(vault.inputToken);
  //   let inputTokenPrice = getUsdPricePerToken(inputTokenAddress);
  //   let inputTokenDecimals = constants.BIGINT_TEN.pow(
  //     inputToken?.decimals as u8
  //   ).toBigDecimal();
  
  //   let depositAmountUSD = depositAmount
  //     .toBigDecimal()
  //     //.div(inputTokenDecimals)
  //     .times(inputTokenPrice.usdPrice)
  //     .div(inputTokenPrice.decimalsBaseTen);
  
  //   vault.inputTokenBalance = vault.inputTokenBalance.plus(depositAmount);
  //   vault.outputTokenSupply = vault.outputTokenSupply!.plus(sharesMinted);
  
  //   vault.totalValueLockedUSD = vault.totalValueLockedUSD.plus(depositAmountUSD);
  //   protocol.totalValueLockedUSD = protocol.totalValueLockedUSD.plus(
  //     depositAmountUSD
  //   );
  
  //   vault.outputTokenPriceUSD = getPriceOfOutputTokens(
  //     vaultAddress,
  //     inputTokenAddress,
  //     inputTokenDecimals
  //   );
  
  //   // vault.pricePerShare = utils
  //   //   .readValue<BigInt>(
  //   //     vaultContract.try_getPricePerFullShare(),
  //   //     constants.BIGINT_ZERO
  //   //   )
  //   //   .toBigDecimal();
  
  //   // Update hourly and daily deposit transaction count
  //   const metricsDailySnapshot = getOrCreateUsageMetricsDailySnapshot(block);
  //   const metricsHourlySnapshot = getOrCreateUsageMetricsHourlySnapshot(block);
  
  //   metricsDailySnapshot.dailyDepositCount += 1;
  //   metricsHourlySnapshot.hourlyDepositCount += 1;
  
  //   metricsDailySnapshot.save();
  //   metricsHourlySnapshot.save();
  //   protocol.save();
  //   vault.save();
  
  //   createDepositTransaction(
  //     to,
  //     vaultAddress,
  //     transaction,
  //     block,
  //     vault.inputToken,
  //     depositAmount,
  //     depositAmountUSD
  //   );
  
  
  //   log.info(
  //     "[Deposit] TxHash: {}, vaultAddress: {}, _sharesMinted: {}, _depositAmount: {}",
  //     [
  //       transaction.hash.toHexString(),
  //       vault.id,
  //       sharesMinted.toString(),
  //       depositAmount.toString(),
  //     ]
  //   );
  // }