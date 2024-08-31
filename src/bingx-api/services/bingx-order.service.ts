import { Injectable } from '@nestjs/common';
import { OrderSideEnum, OrderTypeEnum } from 'bingx-trading-api';
import { X_BINGX_CLIENT } from '~core/constants/bingx.constant';

@Injectable()
export class BingxOrderService {
    constructor() {}

    async buyMarket(symbol: string, quantity?: number): Promise<void> {
        try {
            let quoteOrderQty: number;
            if (!quantity) {
                const spotTradingSymbol = await X_BINGX_CLIENT.spotTradingSymbols({ symbol });
                quoteOrderQty = spotTradingSymbol.data?.symbols[0]?.minNotional;
            } else {
                quoteOrderQty = quantity;
            }

            const queryAssets = await X_BINGX_CLIENT.queryAssets();
            const balances = queryAssets.data?.balances;
            for (const balance of balances) {
                if (balance?.asset === 'USDT') {
                    if (balance?.free < quoteOrderQty) {
                        console.error('BingX Insufficient USDT to Buy Market');
                    }
                }
            }

            const placeOrderResponse = await X_BINGX_CLIENT.placeOrder({
                symbol,
                side: OrderSideEnum.BUY,
                type: OrderTypeEnum.MARKET,
                quoteOrderQty
            });

            if (placeOrderResponse.code !== 0) {
                console.error('Error buyMarket BingxOrderService msg', placeOrderResponse.msg);
            }
        } catch {
            console.error('Error buyMarket BingxOrderService');
        }
    }
}
