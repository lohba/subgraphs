// utilities for Pool updates and pricing

import { Address, BigInt, log, store } from '@graphprotocol/graph-ts'
import { Pool as PoolContract } from '../generated/templates/Pool/Pool'
import { ERC20StakingModule as ERC20StakingModuleContract } from '../generated/templates/Pool/ERC20StakingModule'
import { ERC20BaseRewardModule as ERC20BaseRewardModuleContract } from '../generated/templates/Pool/ERC20BaseRewardModule'
import { Vault, Token, YieldAggregator } from '../generated/schema'
import { integerToDecimal } from '../common/getters'
//import { ZERO_BIG_INT, INITIAL_SHARES_PER_TOKEN, ZERO_BIG_DECIMAL, ONE_E_18 } from '../util/constants'
//import { getPrice } from '../Prices/token'

import {getUsdPricePerToken} from '../Prices/index'
import { updatePricing } from '../Prices/pool'


export function updatePool(
  vault: Vault,
  platform: YieldAggregator,
  stakingToken: Token,
  rewardToken: Token,
  timestamp: BigInt
): void {
  let contract = PoolContract.bind(Address.fromString(vault.id));
  let rewardModule = contract.rewardModule();
  let rewardContract = ERC20BaseRewardModuleContract.bind(rewardModule);

  // tokens
  let priceofStakingToken = getUsdPricePerToken(Address.fromString(stakingToken.id));
  stakingToken.lastPriceUSD = priceofStakingToken.usdPrice

  let priceofRewardToken = getUsdPricePerToken(Address.fromString(rewardToken.id));

  stakingToken.lastPriceBlockNumber = timestamp;
  rewardToken.lastPriceUSD = priceofRewardToken.usdPrice
  rewardToken.lastPriceBlockNumber = timestamp;

  // token amounts
  vault.inputTokenBalance = contract.stakingTotals()[0];
  vault.outputTokenSupply = contract.rewardBalances()[0]


  updatePricing(vault, platform, stakingToken, rewardToken, timestamp);
  //vault.updated = timestamp;
}