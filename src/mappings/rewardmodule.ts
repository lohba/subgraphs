// ERC20 base reward module event handling and mapping

import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import {
  ERC20BaseRewardModule as ERC20BaseRewardModuleContract,
  RewardsFunded,
  GysrSpent,
  RewardsDistributed,
  RewardsExpired
} from '../../generated/templates/ERC20BaseRewardModule/ERC20BaseRewardModule'
import { Vault, Token, YieldAggregator  } from '../../generated/schema'
import { integerToDecimal } from '../common/getters'
import { ZERO_BIG_INT, ZERO_BIG_DECIMAL, ZERO_ADDRESS, GYSR_TOKEN, PRICING_MIN_TVL } from '../util/constants'
import { getPrice, createNewToken } from '../pricing/token'
import { updatePool } from '../utils/pool'
import { updatePoolDayData, updatePlatform } from '../common/initializer'


export function handleRewardsFunded(event: RewardsFunded): void {
  let contract = ERC20BaseRewardModuleContract.bind(event.address);

  let vault = Vault.load(contract.owner().toHexString())!;
  let stakingToken = Token.load(vault.inputToken)!;
  let rewardToken = Token.load(vault.outputToken!)!;
  let platform = YieldAggregator.load(ZERO_ADDRESS)!;

  let amount = integerToDecimal(event.params.amount, new BigInt(rewardToken.decimals))
  pool.rewards = pool.rewards.plus(amount);
  pool.funded = pool.funded.plus(amount);

  // update timeframe for pool
  if (event.params.timestamp.lt(pool.start) || pool.start.equals(ZERO_BIG_INT)) {
    pool.start = event.params.timestamp;
  }
  let addr = Address.fromString(rewardToken.id);
  let idx = contract.fundingCount(addr).minus(BigInt.fromI32(1));
  let fundingStruct = contract.fundings(addr, idx);
  let duration = fundingStruct.value5;

  let end = event.params.timestamp.plus(duration);
  if (end.gt(pool.end) || pool.end.equals(ZERO_BIG_INT)) {
    pool.end = end;
  }

  // create funding
  let fundingId = pool.id + '_' + event.block.timestamp.toString();
  let funding = new Funding(fundingId);
  funding.pool = pool.id;
  funding.token = rewardToken.id;
  funding.createdTimestamp = event.block.timestamp;
  funding.start = event.params.timestamp;
  funding.end = end;
  funding.originalAmount = integerToDecimal(event.params.amount, rewardToken.decimals);
  funding.shares = integerToDecimal(event.params.shares, rewardToken.decimals);
  funding.sharesPerSecond = ZERO_BIG_DECIMAL;
  if (duration.gt(ZERO_BIG_INT)) {
    funding.sharesPerSecond = funding.shares.div(duration.toBigDecimal());
  }
  funding.cleaned = false;
  funding.save(); // save before pricing

  pool.fundings = pool.fundings.concat([funding.id])

  // update pool pricing
  updatePool(pool, platform, stakingToken, rewardToken, event.block.timestamp);

  // update platform
  if (pool.tvl.gt(PRICING_MIN_TVL) && !platform._activePools.includes(pool.id)) {
    log.info('Adding pool to active pricing {}', [pool.id.toString()]);
    platform._activePools = platform._activePools.concat([pool.id]);
  }
  updatePlatform(platform, event.block.timestamp, pool);

  // store
  pool.save();
  stakingToken.save();
  rewardToken.save();
  platform.save();

  log.info('rewards funded {} {} {} {}', [pool.id, rewardToken.symbol, funding.originalAmount.toString(), funding.shares.toString()]);
}


export function handleGysrSpent(event: GysrSpent): void {
  let contract = ERC20BaseRewardModuleContract.bind(event.address);
  let pool = Pool.load(contract.owner().toHexString())!;
  let platform = Platform.load(ZERO_ADDRESS)!;

  // update gysr spent on unstake transaction
  let transaction = new Transaction(event.transaction.hash.toHexString());
  let amount = integerToDecimal(event.params.amount, BigInt.fromI32(18));
  transaction.gysrSpent = amount;

  // update total GYSR spent
  platform.gysrSpent = platform.gysrSpent.plus(amount);
  pool.gysrSpent = pool.gysrSpent.plus(amount);

  // pricing for volume
  let gysr = Token.load(GYSR_TOKEN);
  if (gysr === null) {
    gysr = createNewToken(Address.fromString(GYSR_TOKEN));
  }
  gysr.price = getPrice(gysr, event.block.timestamp);
  gysr.updated = event.block.timestamp;

  let dollarAmount = amount.times(gysr.price);
  let poolDayData = updatePoolDayData(pool, event.block.timestamp.toI32());
  platform.volume = platform.volume.plus(dollarAmount);
  pool.volume = pool.volume.plus(dollarAmount);
  poolDayData.volume = poolDayData.volume.plus(dollarAmount);

  pool.save();
  transaction.save();
  platform.save();
  poolDayData.save();
  gysr.save();
}


export function handleRewardsDistributed(event: RewardsDistributed): void {
  let contract = ERC20BaseRewardModuleContract.bind(event.address);
  let pool = Pool.load(contract.owner().toHexString())!;
  let token = Token.load(pool.rewardToken)!;
  let platform = Platform.load(ZERO_ADDRESS)!;

  let amount = integerToDecimal(event.params.amount, token.decimals);
  pool.distributed = pool.distributed.plus(amount);

  // pricing for volume
  let dollarAmount = amount.times(getPrice(token, event.block.timestamp));
  let poolDayData = updatePoolDayData(pool, event.block.timestamp.toI32());
  platform.volume = platform.volume.plus(dollarAmount);
  pool.volume = pool.volume.plus(dollarAmount);
  poolDayData.volume = poolDayData.volume.plus(dollarAmount);

  // update unstake transaction earnings
  let transaction = new Transaction(event.transaction.hash.toHexString());
  transaction.earnings = amount;

  pool.save();
  transaction.save();
  platform.save();
  poolDayData.save();
}


export function handleRewardsExpired(event: RewardsExpired): void {
  let contract = ERC20BaseRewardModuleContract.bind(event.address);
  let pool = Pool.load(contract.owner().toHexString())!;
  let rewardToken = Token.load(pool.rewardToken)!;
  let amount = integerToDecimal(event.params.amount, rewardToken.decimals);

  let fundings = pool.fundings;
  for (let i = 0; i < fundings.length; i++) {
    let funding = Funding.load(fundings[i])!;

    // mark expired funding as cleaned
    if (funding.start.equals(event.params.timestamp)
      && funding.originalAmount.equals(amount)
      && funding.end.lt(event.block.timestamp)
      && !funding.cleaned) {
      funding.cleaned = true;
      funding.save();
      break;
    }
  }
}