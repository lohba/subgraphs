import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { SECONDS_PER_DAY, USDC_DENOMINATOR } from "../constant";

export function getDay(timestamp: BigInt): i64 {
  return timestamp.toI64() / SECONDS_PER_DAY;
}

export function normalizedUsdcPrice(usdcPrice: BigInt): BigInt {
  return usdcPrice.div(USDC_DENOMINATOR);
}

export function getTimestampInMillis(block: ethereum.Block): BigInt {
  return block.timestamp.times(BigInt.fromI32(1000));
}
