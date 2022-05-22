import { Address } from "@graphprotocol/graph-ts";
import { ERC20 } from "../../generated/GeyserFactoryV1/ERC20";
import { RewardToken, Token } from "../../generated/schema";
import { DEFAULT_DECIMALS, RewardTokenType } from "./constants";
import { readValue } from "../utils/contracts";

export function getOrCreateToken(id: Address): Token {
  let token = Token.load(id.toHex());

  if (token) {
    return token as Token;
  }

  token = new Token(id.toHex());

  let erc20Contract = ERC20.bind(id);
  token.name = readValue<string>(erc20Contract.try_name(), "");
  token.symbol = readValue<string>(erc20Contract.try_symbol(), "");
  token.decimals = readValue<i32>(erc20Contract.try_decimals(), DEFAULT_DECIMALS);
  token.save();

  return token as Token;
}

export function getOrCreateReward(id: Address): RewardToken {
  let token = RewardToken.load(id.toHex());

  if (token) {
    return token;
  }

  token = new RewardToken(id.toHex());

  let erc20Contract = ERC20.bind(id);
  token.token = readValue<string>(erc20Contract.try_name(), "");
  //token.symbol = readValue<string>(erc20Contract.try_symbol(), "");
  //token.decimals = readValue<i32>(erc20Contract.try_decimals(), DEFAULT_DECIMALS);
  token.type = RewardTokenType.DEPOSIT;
  token.save();

  return token;
}

export function fetchTokenSymbol(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress);
  let symbol = contract.try_symbol();
  if (symbol.reverted) {
    return "";
  }
  return symbol.value;
}

export function fetchTokenName(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress);
  let name = contract.try_name();
  if (name.reverted) {
    return "";
  }
  return name.value;
}

export function fetchTokenDecimals(tokenAddress: Address): i32 {
  let contract = ERC20.bind(tokenAddress);
  let decimals = contract.try_decimals();
  if (decimals.reverted) {
    return 18;
  }
  return decimals.value;
}