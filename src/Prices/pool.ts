// pricing for pool information on apr, tvl, and more

import { Address, BigInt, BigDecimal, log, store } from '@graphprotocol/graph-ts'
import { Vault, YieldAggregator, Token, Deposit } from '../generated/schema'
import { integerToDecimal } from '../common/getters'
import { INITIAL_SHARES_PER_TOKEN, BIGDECIMAL_ZERO } from '../common/constants';
import {getOrCreateToken} from '../common/getters'

export function updatePricing(
  vault: Vault,
  platform: YieldAggregator,
  stakingToken: Token,
  rewardToken: Token,
  timestamp: BigInt
): void {

  // usd amounts
  platform.totalValueLockedUSD = platform.totalValueLockedUSD.minus(vault.totalValueLockedUSD);
  vault.inputTokenBalance = BigInt.fromString(vault.inputTokenBalance.toBigDecimal().times(stakingToken.lastPriceUSD).toString());
  //vault.rewardTokens = pool.rewards.times(rewardToken.price); // Missing rewards (BigDecimal) = token amount * price
  let inputToken1 = getOrCreateToken(Address.fromString(stakingToken.id))
  let rewardToken1 = getOrCreateToken(Address.fromString(rewardToken.id))

  vault.totalValueLockedUSD = inputToken1.lastPriceUSD.plus(rewardToken1.lastPriceUSD);
  platform.totalValueLockedUSD = platform.totalValueLockedUSD.plus(vault.totalValueLockedUSD);

// fundings
//   let fundings = vault.inputToken;
//   let active = false;
//   let next = BigInt.fromI32(10).times(timestamp);
//   let rate = BIGDECIMAL_ZERO;
//   for (let i = 0; i < fundings.length; i++) {
//     let funding = Funding.load(fundings[i])!;
//     // active
//     if (funding.start.le(timestamp) && funding.end.gt(timestamp) && !active) {
//       active = true;
//       rate = BIGDECIMAL_ZERO;
//     }
//     // boiling
//     else if (funding.start.gt(timestamp) && funding.start.lt(next) && !active) {
//       next = funding.start;
//       rate = BIGDECIMAL_ZERO;
//     }

//     // rate
//     if ((active && funding.start.lt(timestamp) && funding.end.gt(timestamp))
//       || (!active && funding.start == next)) {
//       // shares per second
//       rate = rate.plus(funding.sharesPerSecond);
//     }
//   }
//   pool.sharesPerSecond = rate;

//   // apr
//   if (rate.gt(BIGDECIMAL_ZERO)
//     && rewardToken.price.gt(BIGDECIMAL_ZERO)
//     && pool.stakedUSD.gt(BIGDECIMAL_ZERO)
//   ) {
//     let yearly = BigDecimal.fromString('31536000').times(
//       rewardToken.price.times(
//         rate.div(pool.rewardSharesPerToken)
//       )
//     );
//     pool.apr = yearly.div(pool.stakedUSD).times(BigDecimal.fromString('100'));

//   } else {
//     pool.apr = BIGDECIMAL_ZERO;
//   }

//   // state
//   if (active) {
//     pool.state = 'Active';
//   } else if (rate.gt(BIGDECIMAL_ZERO)) {
//     pool.state = 'Boiling';
//   } else if (pool.funded.gt(BIGDECIMAL_ZERO)) {
//     pool.state = 'Stale';
//   }
 }