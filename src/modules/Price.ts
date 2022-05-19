import {
    BigInt,
    Address,
    BigDecimal,
    dataSource,
  } from "@graphprotocol/graph-ts";
  import * as utils from "../common/utils";
  import * as constants from "../common/constants";
  import { Pool as Vault} from "../../generated/templates/Pool/Pool";
  import { getPriceUsdcRecommended } from "../Prices/routers/CurveRouter";
import { Token } from "../../generated/schema";
  
  export function getPriceOfOutputTokens(
    vaultAddress: Address,
    tokenAddress: Address,
    _decimals: BigDecimal
  ): BigDecimal {
    const network = dataSource.network();
    const vaultContract = Vault.bind(vaultAddress);
    let token = Token.load(tokenAddress.toHexString())
    let pricePerShare = token?.lastPriceUSD;
  
    let virtualPrice = getPriceUsdcRecommended(tokenAddress, network);
    if(pricePerShare == undefined) {
        return constants.BIGDECIMAL_ZERO;
    } 
    
    return pricePerShare
      .div(_decimals)
      .times(virtualPrice.usdPrice)
      .div(virtualPrice.decimalsBaseTen);
  }