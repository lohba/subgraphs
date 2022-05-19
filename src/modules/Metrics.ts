
import {
    getOrCreateAccount,
    getOrCreateYieldAggregator,
    getOrCreateVaultsDailySnapshots,
    getOrCreateVaultsHourlySnapshots,
    getOrCreateFinancialDailySnapshots,
    getOrCreateUsageMetricsDailySnapshot,
    getOrCreateUsageMetricsHourlySnapshot,
  } from "../common/initializer";
  import * as constants from "../common/constants";
  import { Address, ethereum } from "@graphprotocol/graph-ts";
  import { ActiveAccount, Vault as VaultStore } from "../../generated/schema";


export function updateVaultSnapshots(
    vaultAddress: Address,
    block: ethereum.Block
  ): void {
    let vault = VaultStore.load(vaultAddress.toHexString())!;
  
    const vaultDailySnapshots = getOrCreateVaultsDailySnapshots(
      vaultAddress,
      block
    );
    const vaultHourlySnapshots = getOrCreateVaultsHourlySnapshots(
      vaultAddress,
      block
    );
  
    vaultDailySnapshots.totalValueLockedUSD = vault.totalValueLockedUSD;
    vaultHourlySnapshots.totalValueLockedUSD = vault.totalValueLockedUSD;
  
    vaultDailySnapshots.inputTokenBalance = vault.inputTokenBalance;
    vaultHourlySnapshots.inputTokenBalance = vault.inputTokenBalance;
  
    vaultDailySnapshots.outputTokenSupply = vault.outputTokenSupply!;
    vaultHourlySnapshots.outputTokenSupply = vault.outputTokenSupply!;
  
    vaultDailySnapshots.outputTokenPriceUSD = vault.outputTokenPriceUSD;
    vaultHourlySnapshots.outputTokenPriceUSD = vault.outputTokenPriceUSD;
  
    vaultDailySnapshots.pricePerShare = vault.pricePerShare;
    vaultHourlySnapshots.pricePerShare = vault.pricePerShare;
  
    vaultDailySnapshots.rewardTokenEmissionsAmount =
      vault.rewardTokenEmissionsAmount;
    vaultHourlySnapshots.rewardTokenEmissionsAmount =
      vault.rewardTokenEmissionsAmount;
  
    vaultDailySnapshots.rewardTokenEmissionsUSD = vault.rewardTokenEmissionsUSD;
    vaultHourlySnapshots.rewardTokenEmissionsUSD = vault.rewardTokenEmissionsUSD;
  
    vaultDailySnapshots.blockNumber = block.number;
    vaultHourlySnapshots.blockNumber = block.number;
  
    vaultDailySnapshots.timestamp = block.timestamp;
    vaultHourlySnapshots.timestamp = block.timestamp;
  
    vaultDailySnapshots.save();
    vaultHourlySnapshots.save();
  }