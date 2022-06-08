// ERC20 staking module event handling and mapping
import { Address, BigInt, log, store } from '@graphprotocol/graph-ts'
import {
  ERC20StakingModule as ERC20StakingModuleContract,
  Staked,
  Unstaked,
  Claimed
} from '../generated/templates/ERC20StakingModule/ERC20StakingModule'
import { Vault, Token, RewardToken, Account, YieldAggregator, Deposit, Withdraw } from '../generated/schema'
import { getOrCreateAccount, updatePoolDayData } from '../common/initializer'
import { getOrCreateProtocol } from '../common/protocol'
import { BIGINT_ZERO, BIGDECIMAL_ZERO, ZERO_ADDRESS, INT_ONE } from '../common/constants'
import { updatePool } from '../utils/pool'
import { updateFinancials, updateUsageMetrics, updateVaultSnapshots } from "../modules/Metrics";
import { integerToDecimal } from '../common/getters'
import { getUsdPricePerToken } from "../Prices/index"

export function handleStaked(event: Staked): void {
  // load pool and tokens
  let contract = ERC20StakingModuleContract.bind(event.address);
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
}


export function handleUnstaked(event: Unstaked): void {
  // load pool and token
  let contract = ERC20StakingModuleContract.bind(event.address);
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
}


export function handleClaimed(event: Claimed): void {
  // load pool and token
  let contract = ERC20StakingModuleContract.bind(event.address);
  let vault = Vault.load(contract.owner().toHexString())!;
  let stakingToken = Token.load(vault.inputToken)!;
  let rewardToken = Token.load(vault.outputToken)!;
  let platform = YieldAggregator.load(ZERO_ADDRESS)!;


  // update pricing info
  updatePool(vault, platform, stakingToken, rewardToken, event.block.timestamp);

  // not considering claim amount in volume

  // update daily pool info
  let poolDayData = updatePoolDayData(vault, event.block.timestamp.toI32());

  // store
  vault.save();
  poolDayData.save();
}