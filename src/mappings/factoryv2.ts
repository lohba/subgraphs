// GYSR factory event handling and mapping

import { Address, BigInt, BigDecimal, log } from '@graphprotocol/graph-ts'
import { GeyserCreated } from '../../generated/GeyserFactoryV1/GeyserFactoryV1'
import { GeyserV1 as GeyserContractV1 } from '../../generated/GeyserFactoryV1/GeyserV1'
import { GeyserV1 as GeyserTemplateV1 } from '../../generated/templates'
import { Vault, Token } from '../../generated/schema'
import { Pool as VaultContract } from "../../generated/PoolFactory/Pool";
import { YieldAggregator, Vault as VaultStore } from "../../generated/schema";
import { BIGINT_ZERO, BIGDECIMAL_ZERO, ZERO_ADDRESS, PROTOCOL_ID, INT_ONE } from '../common/constants'
import { getOrCreateToken, getOrCreateRewardToken } from '../common/getters'
import {getOrCreateProtocol} from '../common/protocol'
import {getOrCreateAccount} from '../common/initializer';

export function handleGeyserV1Created(event: GeyserCreated): void {

  // interface to actual Geyser contract
  let contract = GeyserContractV1.bind(event.params.geyser);

  // staking token
  let stakingToken = getOrCreateToken(contract.stakingToken());

  // reward token
  let rewardToken = getOrCreateRewardToken(contract.rewardToken())

  // platform
  let protocol = getOrCreateProtocol();

  // user
  let user = getOrCreateAccount(event.params.user.toHexString());

  // pool entity
  const vault = new VaultStore(event.params.geyser.toHexString());
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

  //log.info('created new pool: geyser v1, {}, {}, {}', [vault.id, stakingToken.symbol, rewardToken.symbol]);

  // create template event handler
  GeyserTemplateV1.create(event.params.geyser);
}