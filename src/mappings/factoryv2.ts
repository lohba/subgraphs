// GYSR factory event handling and mapping
import { GeyserCreated } from '../generated/GeyserFactoryV1/GeyserFactoryV1'
import { GeyserV1 as GeyserContractV1 } from '../generated/GeyserFactoryV1/GeyserV1'
import { GeyserV1 as GeyserTemplateV1 } from '../generated/templates'
import { Vault as VaultStore } from "../generated/schema";
import { BIGINT_ZERO, BIGDECIMAL_ZERO, PROTOCOL_ID } from '../common/constants'
import { getOrCreateToken, getOrCreateRewardToken } from '../common/getters'
import {getOrCreateProtocol} from '../common/protocol'
import {getOrCreateAccount} from '../common/initializer';

export function handleGeyserCreated(event: GeyserCreated): void {

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
  vault.protocol = PROTOCOL_ID

  vault.name = stakingToken.name; 
  vault.symbol = stakingToken.symbol;
  vault.inputToken = stakingToken.id;
  vault.inputTokenBalance = BIGINT_ZERO;
  // staking token
  vault.outputToken = rewardToken.id;
  vault.outputTokenSupply = BIGINT_ZERO;
  vault.totalValueLockedUSD = BIGDECIMAL_ZERO;
  vault.createdBlockNumber = event.block.number;
  vault.createdTimestamp = event.block.timestamp;
  // added 
  vault.depositLimit = BIGINT_ZERO;
  vault.outputTokenPriceUSD = BIGDECIMAL_ZERO;
  vault.pricePerShare = BIGDECIMAL_ZERO;
  vault.stakedOutputTokenAmount = BIGINT_ZERO;
  vault.rewardTokenEmissionsAmount = [BIGINT_ZERO, BIGINT_ZERO];
  vault.rewardTokenEmissionsUSD = [BIGDECIMAL_ZERO, BIGDECIMAL_ZERO];
  // vault.fees = createPoolFees(poolAddress.toHexString());
  vault.createdTimestamp = event.block.timestamp;
  vault.createdBlockNumber = event.block.number;
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