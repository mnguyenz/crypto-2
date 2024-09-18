import { Injectable } from '@nestjs/common';
import { OrderSideEnum } from 'bingx-trading-api';
import { X_OKX_CLIENT } from '~core/constants/okx.constant';
import { OkxNewLimitOrderParam } from '~core/types/okx-new-limit-order.param';

@Injectable()
export class OkxTradeService {
    constructor() {}

    async newLimitOrder(okxNewLimitOrderParam: OkxNewLimitOrderParam): Promise<any> {
        const { symbol, side, quantity, price } = okxNewLimitOrderParam;
        try {
            return X_OKX_CLIENT.submitOrder({
                instId: symbol,
                tdMode: 'cash',
                side: side === OrderSideEnum.BUY ? 'buy' : 'sell',
                ordType: 'limit',
                sz: quantity.toString(),
                px: price.toString()
            });
        } catch (error) {
            console.error('newOrder OKX error:', error);
        }
    }
}
