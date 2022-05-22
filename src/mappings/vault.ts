// V2 Pool event handling and mapping

import { Address, BigInt, log, store } from '@graphprotocol/graph-ts'
import { ControlTransferred, OwnershipTransferred } from '../../generated/PoolFactory/Pool'
import { Vault, Account, YieldAggregator, UsageMetricsDailySnapshot } from '../../generated/schema'
import { getOrCreateAccount } from '../common/initializer'
import { ZERO_ADDRESS, INT_ONE, SECONDS_PER_DAY, SECONDS_PER_HOUR  } from '../common/constants'
import { getOrCreateFinancialsDailySnapshot, getOrCreateUsageMetricDailySnapshot, getOrCreateUsageMetricHourlySnapshot } from "../common/getters";


export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let vault = Vault.load(event.address.toHexString())!;
  let platform = YieldAggregator.load(ZERO_ADDRESS)!;
  let newOwner = Account.load(event.params.newOwner.toHexString());
  if (newOwner == null) {
    newOwner = getOrCreateAccount(event.params.newOwner.toHexString());
    newOwner.save()
    platform.cumulativeUniqueUsers = platform.cumulativeUniqueUsers += INT_ONE;
  }
  //vault.owner = newOwner
  //vault.save()  
  platform.save()
}

export function handleControlTransferred(event: ControlTransferred): void {
  let vault = Vault.load(event.address.toHexString())!;
  let platform = YieldAggregator.load(ZERO_ADDRESS)!;

  let newOwner = Account.load(event.params.newController.toHexString());
  if (newOwner == null) {
    newOwner = getOrCreateAccount(event.params.newController.toHexString());
    newOwner.save()
    platform.cumulativeUniqueUsers = platform.cumulativeUniqueUsers += INT_ONE;
  }

  //vault.owner = newOwner
  //vault.save()
  platform.save();
}
