import { ethereum } from "@graphprotocol/graph-ts";
import { BigDecimal, BigInt, Address } from '@graphprotocol/graph-ts';

export function readValue<T>(callResult: ethereum.CallResult<T>, defaultValue: T): T {
  return callResult.reverted ? defaultValue : callResult.value;
}

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const GYSR_TOKEN = "0xbea98c05eeae2f3bc8c3565db7551eb738c8ccab";

export let ZERO_BIG_INT = BigInt.fromI32(0);
export let ZERO_BIG_DECIMAL = BigDecimal.fromString('0');

export let PRICING_MIN_TVL = BigDecimal.fromString('1000.0');