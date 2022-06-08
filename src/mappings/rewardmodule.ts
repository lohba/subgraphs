// ERC20 base reward module event handling and mapping

import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import {
  ERC20BaseRewardModule as ERC20BaseRewardModuleContract,
  RewardsFunded,
  GysrSpent,
  RewardsDistributed,
  RewardsExpired,
} from '../generated/templates/ERC20BaseRewardModule/ERC20BaseRewardModule'
import { Vault, Token, YieldAggregator  } from '../generated/schema'
import { integerToDecimal } from '../common/getters'
import { ZERO_BIG_INT, ZERO_BIG_DECIMAL, ZERO_ADDRESS, GYSR_TOKEN} from '../utils/contracts'
// import { getPrice, createNewToken } from '../pricing/token'
import { updatePool } from '../utils/pool'
import { updatePoolDayData } from '../common/initializer'
import { readValue } from "../utils/contracts";
import {getUsdPricePerToken} from "../Prices/index"


export function handleRewardsFunded(event: RewardsFunded): void {
  let contract = ERC20BaseRewardModuleContract.bind(event.address);

  let vault = Vault.load(contract.owner().toHexString())!;
  // if (vault == null) {
  //   vault = new Vault(contract.owner().toHexString());
  // }
  let stakingToken = Token.load(vault.inputToken)!;
  let rewardToken = Token.load(vault.outputToken)!;
  let platform = YieldAggregator.load(ZERO_ADDRESS)!;
  let amount = integerToDecimal(event.params.amount, stakingToken.decimals)

  let stakingTokenPrice = getUsdPricePerToken(Address.fromString(stakingToken.id));
  stakingToken.lastPriceUSD = stakingTokenPrice.usdPrice;
  stakingToken.lastPriceBlockNumber = event.block.number;
  stakingToken.save();

  vault.totalValueLockedUSD = stakingToken.lastPriceUSD.times(
    vault.inputTokenBalance.toBigDecimal().div(stakingToken.decimals.toBigDecimal()),
  );
  vault.outputTokenPriceUSD = getUsdPricePerToken(Address.fromString(stakingToken.id)).usdPrice;
  vault.save();

  // update pool pricing
  updatePool(vault, platform, stakingToken, rewardToken, event.block.timestamp);

  // store
  stakingToken.save();
  rewardToken.save();
  // platform.save();

  log.info('rewards funded {} {} {} {}', [vault.id, rewardToken.symbol, amount.toString()]);
}


export function handleGysrSpent(event: GysrSpent): void {
  let contract = ERC20BaseRewardModuleContract.bind(event.address);
  let vault = Vault.load(contract.owner().toHexString())!;
  // if (vault == null) {
  //   vault = new Vault(contract.owner().toHexString());
  // }
  let stakingToken = Token.load(vault.inputToken)!;
  let rewardToken = Token.load(vault.outputToken)!;
  let platform = YieldAggregator.load(ZERO_ADDRESS)!;
  let amount = integerToDecimal(event.params.amount, rewardToken.decimals)

  let stakingTokenPrice = getUsdPricePerToken(Address.fromString(stakingToken.id));
  stakingToken.lastPriceUSD = stakingTokenPrice.usdPrice;
  stakingToken.lastPriceBlockNumber = event.block.number;
  stakingToken.save();

  vault.totalValueLockedUSD = stakingToken.lastPriceUSD.times(
    vault.inputTokenBalance.toBigDecimal().div(stakingToken.decimals.toBigDecimal()),
  );
  vault.outputTokenPriceUSD = getUsdPricePerToken(Address.fromString(stakingToken.id)).usdPrice;
  vault.save();

  // update pool pricing
  updatePool(vault, platform, stakingToken, rewardToken, event.block.timestamp);

  // store
  stakingToken.save();
  rewardToken.save();
  // platform.save();

  log.info('rewards funded {} {} {} {}', [vault.id, rewardToken.symbol, amount.toString()]);
}


export function handleRewardsDistributed(event: RewardsDistributed): void {
  let contract = ERC20BaseRewardModuleContract.bind(event.address);
  
}


export function handleRewardsExpired(event: RewardsExpired): void {
  let contract = ERC20BaseRewardModuleContract.bind(event.address);
  
}