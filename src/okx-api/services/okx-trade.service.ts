import { Injectable } from '@nestjs/common';
import { OrderSideEnum } from 'bingx-trading-api';
import { M_OKX_CLIENT, X_OKX_CLIENT } from '~core/constants/okx.constant';
import { AccountEnum } from '~core/enums/exchanges.enum';
import { OkxNewLimitOrderParam } from '~core/types/okx-new-limit-order.param';

@Injectable()
export class OkxTradeService {
    constructor() {}

    async newLimitOrder(okxNewLimitOrderParam: OkxNewLimitOrderParam, account?: AccountEnum): Promise<any> {
        const client = account === AccountEnum.M ? M_OKX_CLIENT : X_OKX_CLIENT;
        const { symbol, side, quantity, price } = okxNewLimitOrderParam;
        try {
            return client.submitOrder({
                instId: symbol,
                tdMode: 'cash',
                side: side === OrderSideEnum.BUY ? 'buy' : 'sell',
                ordType: 'limit',
                sz: quantity.toString(),
                px: price.toString()
            });
        } catch (error) {
            console.error('OKX OkxTradeService newLimitOrder error:', error);
        }
    }
}
