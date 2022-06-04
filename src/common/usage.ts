import { Address, BigInt } from "@graphprotocol/graph-ts";
import { UsageMetricsDailySnapshot, YieldAggregator, Account, DailyActiveAccount } from "../generated/schema";
import { PROTOCOL_ID, SECONDS_PER_DAY } from "./constants";
import { getOrCreateProtocol } from "./protocol";

export function updateUsageMetrics(blockNumber: BigInt, timestamp: BigInt, from: Address): void {
  // Number of days since Unix epoch
  let id: i64 = timestamp.toI64() / SECONDS_PER_DAY;
  let usageMetrics = UsageMetricsDailySnapshot.load(id.toString());

  if (!usageMetrics) {
    usageMetrics = new UsageMetricsDailySnapshot(id.toString());
    usageMetrics.protocol = PROTOCOL_ID;

    usageMetrics.dailyActiveUsers = 0;
    usageMetrics.cumulativeUniqueUsers = 0;
    usageMetrics.dailyTransactionCount = 0;
  }

  // Update the block number and timestamp to that of the last transaction of that day
  usageMetrics.blockNumber = blockNumber;
  usageMetrics.timestamp = timestamp;
  usageMetrics.dailyTransactionCount += 1;
  let protocol = getOrCreateProtocol();
  let accountId = from.toHexString();
  let account = Account.load(accountId);
  if (!account) {
    account = new Account(accountId);
    account.save();
    protocol.cumulativeUniqueUsers += 1;
    protocol.save();
  }
  usageMetrics.cumulativeUniqueUsers += 1;

  // Combine the id and the user address to generate a unique user id for the day
  let dailyActiveAccountId = id.toString() + "-" + from.toHexString();
  let dailyActiveAccount = DailyActiveAccount.load(dailyActiveAccountId);
  if (!dailyActiveAccount) {
    dailyActiveAccount = new DailyActiveAccount(dailyActiveAccountId);
    dailyActiveAccount.save();
    usageMetrics.dailyActiveUsers += 1;
  }

  usageMetrics.save();
}