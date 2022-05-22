// V2 Pool Factory event handling and mapping

import { Address, BigDecimal, BigInt, log } from '@graphprotocol/graph-ts'
import { PoolCreated } from '../../generated/PoolFactory/PoolFactory'
import { Pool as PoolContract } from '../../generated/PoolFactory/Pool'
import { ERC20StakingModule as ERC20StakingModuleContract } from '../../generated/PoolFactory/ERC20StakingModule'
import { ERC20BaseRewardModule as ERC20BaseRewardModuleContract } from '../../generated/PoolFactory/ERC20BaseRewardModule'
import { ERC20CompetitiveRewardModule as ERC20CompetitiveRewardModuleContract } from '../../generated/PoolFactory/ERC20CompetitiveRewardModule'
import { ERC20FriendlyRewardModule as ERC20FriendlyRewardModuleContract } from '../../generated/PoolFactory/ERC20FriendlyRewardModule'
import { Vault, YieldAggregator, Token, Account } from '../../generated/schema'
import { Vault as VaultStore } from '../../generated/schema'
import { Pool as VaultContract } from "../../generated/PoolFactory/Pool";


import {
  Pool as PoolTemplate,
  ERC20BaseRewardModule as ERC20BaseRewardModuleTemplate,
  ERC20StakingModule as ERC20StakingModuleTemplate
} from '../../generated/templates'
import {
  BIGINT_ZERO,
  BIGDECIMAL_ZERO,
  INITIAL_SHARES_PER_TOKEN,
  ZERO_ADDRESS,
  PROTOCOL_ID,
  ERC20_COMPETITIVE_REWARD_MODULE_FACTORIES,
  ERC20_FRIENDLY_REWARD_MODULE_FACTORIES,
  ERC20_STAKING_MODULE_FACTORIES,
  ERC721_STAKING_MODULE_FACTORIES
} from '../common/constants'
import { getOrCreateToken, getOrCreateReward } from '../common/token'
import {getOrCreateProtocol} from '../common/protocol'
import {getOrCreateAccount} from '../common/initializer';


export function handlePoolCreated(event: PoolCreated): void {

  // interface to actual Pool contract
  let contract = PoolContract.bind(event.params.pool);

  // modules
  let stakingModule = contract.stakingModule();
  let stakingModuleContract = ERC20StakingModuleContract.bind(stakingModule)
  let rewardModule = contract.rewardModule();
  let rewardModuleContract = ERC20BaseRewardModuleContract.bind(rewardModule);

  // staking token
  let stakingToken = getOrCreateToken(stakingModuleContract.tokens()[0]);

  // reward token
  let rewardToken = getOrCreateReward(rewardModuleContract.tokens()[0])

  // platform
  let protocol = getOrCreateProtocol();

  // user
  let user = getOrCreateAccount(event.params.user.toHexString());

  // pool entity
  const vault = new VaultStore(event.params.pool.toHexString());
  const vaultContract = VaultContract.bind(Address.fromString(vault.id));
  vault.protocol = PROTOCOL_ID

  vault.name = stakingToken.name;
  vault.symbol = stakingToken.symbol;
  const inputToken = stakingToken;
  vault.inputToken = inputToken.name;
  vault.inputTokenBalance = BIGINT_ZERO;
  // staking token
  vault.outputToken = stakingToken.id;
  vault.outputTokenSupply = BIGINT_ZERO;
  vault.totalValueLockedUSD = BIGDECIMAL_ZERO;
  vault.createdBlockNumber = event.block.number;
  vault.createdTimestamp = event.block.timestamp;
  // reward token
  vault.rewardTokens = [rewardToken.id];
  vault.fees = [];
  vault.save();

  protocol.vaults.push(vault.id);

  vault.save();
  user.save();
  protocol.save();

  // reward type
  let rewardFactory = rewardModuleContract.factory();
//   if (ERC20_COMPETITIVE_REWARD_MODULE_FACTORIES.includes(rewardFactory)) {
//     let competitiveContract = ERC20CompetitiveRewardModuleContract.bind(rewardModule)
//     // pool.timeMultMin = integerToDecimal(competitiveContract.bonusMin());
//     // pool.timeMultMax = integerToDecimal(competitiveContract.bonusMax());
//     // pool.timeMultPeriod = competitiveContract.bonusPeriod();
    
//     vault.rewardModuleType = 'ERC20Competitive';
//   } else if (ERC20_FRIENDLY_REWARD_MODULE_FACTORIES.includes(rewardFactory)) {
//     let friendlyContract = ERC20FriendlyRewardModuleContract.bind(rewardModule);
//     // pool.timeMultMin = integerToDecimal(friendlyContract.vestingStart());
//     // pool.timeMultMax = BigDecimal.fromString('1');
//     // pool.timeMultPeriod = friendlyContract.vestingPeriod();
//     vault.rewardModuleType = 'ERC20Friendly';
//   } else {
//     log.info('unknown reward module type: {}', [rewardFactory.toHexString()]);
//     return;
//   }

  // staking type
  let stakingFactory = stakingModuleContract.factory();
//   if (ERC20_STAKING_MODULE_FACTORIES.includes(stakingFactory)) {
//     vault.stakingModuleType = 'ERC20';
//     vault.stakingSharesPerToken = INITIAL_SHARES_PER_TOKEN;
//   } else if (ERC721_STAKING_MODULE_FACTORIES.includes(stakingFactory)) {
//     vault.stakingModuleType = 'ERC721';
//     vault.stakingSharesPerToken = ONE_E_18;
//   } else {
//     log.info('unknown staking module type: {}', [stakingFactory.toHexString()]);
//     return;
//   }

//   // type nickname
//   if (pool.stakingModuleType == 'ERC20') {
//     if (pool.rewardModuleType == 'ERC20Competitive') {
//       pool.poolType = 'GeyserV2';
//     } else {
//       pool.poolType = 'Fountain'
//     }
//   } else {
//     if (pool.rewardModuleType == 'ERC20Friendly') {
//       pool.poolType = 'Aquarium';
//     } else {
//       pool.poolType = 'Unknown';
//     }
//   }

//   vault.createdBlock = event.block.number;
//   pool.createdTimestamp = event.block.timestamp;
//   pool.tags = (
//     stakingToken.symbol
//     + " " + stakingToken.name
//     + " " + rewardToken.symbol
//     + " " + rewardToken.name
//   );

//   pool.users = ZERO_BIG_INT;
//   pool.operations = ZERO_BIG_INT;
//   pool.staked = ZERO_BIG_DECIMAL;
//   pool.rewards = ZERO_BIG_DECIMAL;
//   pool.funded = ZERO_BIG_DECIMAL;
//   pool.distributed = ZERO_BIG_DECIMAL;
//   pool.gysrSpent = ZERO_BIG_DECIMAL;
//   pool.sharesPerSecond = ZERO_BIG_DECIMAL;
//   pool.fundings = [];

//   pool.start = ZERO_BIG_INT;
//   pool.end = ZERO_BIG_INT;
//   pool.state = 'Unfunded';
//   pool.stakedUSD = ZERO_BIG_DECIMAL;
//   pool.rewardsUSD = ZERO_BIG_DECIMAL;
//   pool.tvl = ZERO_BIG_DECIMAL;
//   pool.apr = ZERO_BIG_DECIMAL;
//   pool.usage = ZERO_BIG_DECIMAL;
//   pool.rewardSharesPerToken = INITIAL_SHARES_PER_TOKEN;
//   pool.updated = ZERO_BIG_INT;
//   pool.volume = ZERO_BIG_DECIMAL;

//   platform.pools = platform.pools.plus(BigInt.fromI32(1));

//   pool.save();
//   user.save();
//   platform.save();

//   log.info('created new v2 pool: {}, {}, {}, {}', [pool.id, pool.poolType, stakingToken.symbol, rewardToken.symbol]);

  // create template event handler
  PoolTemplate.create(event.params.pool);
  ERC20BaseRewardModuleTemplate.create(rewardModuleContract._address);
  ERC20StakingModuleTemplate.create(stakingModuleContract._address);
}