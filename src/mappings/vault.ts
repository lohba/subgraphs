// V2 Pool event handling and mapping

import { Address, BigInt, log, store } from '@graphprotocol/graph-ts'
import { ControlTransferred, OwnershipTransferred } from '../../generated/PoolFactory/Pool'
import { Vault, Account, Protocol, UsageMetricsDailySnapshot } from '../../generated/schema'
import { createNewPlatform, getOrCreateAccount } from '../common/initializer'
import { ZERO_ADDRESS, INT_ONE, SECONDS_PER_DAY, SECONDS_PER_HOUR, UsageType  } from '../common/constants'
import { getLiquidityPool, getOrCreateDex, getOrCreateFinancialsDailySnapshot, getOrCreateLiquidityPoolDailySnapshot, getOrCreateLiquidityPoolHourlySnapshot, getOrCreateUsageMetricDailySnapshot, getOrCreateUsageMetricHourlySnapshot } from "./getters";


export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let newOwner = Account.load(event.params.newOwner.toHexString());
  if (newOwner == null) {
    newOwner = getOrCreateAccount(event.params.newOwner.toHexString());
    let usageMetricsDaily = getOrCreateUsageMetricDailySnapshot(event);
    usageMetricsDaily.dailyActiveUsers =  usageMetricsDaily.dailyActiveUsers += INT_ONE;
    newOwner.save()
  }
}

export function handleControlTransferred(event: ControlTransferred): void {
  let pool = Vault.load(event.address.toHexString())!;
  let platform = Protocol.load(ZERO_ADDRESS)!;

  let newOwner = Account.load(event.params.newController.toHexString());
  if (newOwner == null) {
    newOwner = getOrCreateAccount(event.params.newController.toHexString());
    let usageMetricsDaily = getOrCreateUsageMetricDailySnapshot(event);
    usageMetricsDaily.dailyActiveUsers =  usageMetricsDaily.dailyActiveUsers += INT_ONE;
    newOwner.save()
  }

  handleOwnershipTransferred(event.params.previousController, event.params.newController)
  //pool.owner = newOwner.id;

  pool.save();
  platform.save();
}
