import { Injectable } from '@nestjs/common';
import { ASSETS } from '~core/constants/crypto-code.constant';
import { OkxEarnService } from './okx-earn.service';
import { MIN_NOTIONAL } from '~core/constants/bingx.constant';
import { AccountEnum } from '~core/enums/exchanges.enum';
import { OrderSideEnum } from 'bingx-trading-api';
import { OkxTradeService } from './okx-trade.service';
import { OkxRedeemUsdThenOrderParam } from '~core/types/okx-redeem-usd-then-order.param';
import { X_OKX_CLIENT } from '~core/constants/okx.constant';

@Injectable()
export class OkxOrderService {
    constructor(
        private okxEarnService: OkxEarnService,
        private okxTradeService: OkxTradeService
    ) {}

    async redeemUsdThenOrder(
        okxRedeemUsdThenOrderParam: OkxRedeemUsdThenOrderParam,
        account?: AccountEnum
    ): Promise<void> {
        const { symbol, price, quantity } = okxRedeemUsdThenOrderParam;
        let asset;
        if (symbol.endsWith(ASSETS.FIAT.USDT)) {
            asset = ASSETS.FIAT.USDT;
        } else if (symbol.endsWith(ASSETS.FIAT.USDC)) {
            asset = ASSETS.FIAT.USDC;
        }
        await this.okxEarnService.redeem(asset, MIN_NOTIONAL, account);
        await this.okxTradeService.newLimitOrder(
            {
                symbol,
                side: OrderSideEnum.BUY,
                price,
                quantity
            },
            account
        );
    }

    async buyMinNotional(symbol: string, currentPrice: number, account?: AccountEnum): Promise<void> {
        let lotSize: number;
        try {
            const exchangeInformations = await X_OKX_CLIENT.getInstruments('SPOT', undefined, undefined, symbol);
            lotSize = parseFloat(exchangeInformations[0].lotSz);
        } catch (error) {
            console.error('OKX OkxOrderService buyMinNotional GetInstruments error:', error);
        }

        const rawQuantity = MIN_NOTIONAL / currentPrice;
        const quantity = Math.floor(rawQuantity / lotSize) * lotSize;

        await this.redeemUsdThenOrder(
            {
                symbol,
                price: currentPrice,
                quantity
            },
            account
        );
    }
}
