import { Injectable } from '@nestjs/common';
import { X_OKX_CLIENT } from '~core/constants/okx.constant';
import { GetOrderBookResponse } from '~okx-api/responses/get-order-book.response';

@Injectable()
export class OkxMarketService {
    constructor() {}

    async getOrderBook(symbol: string, limit?: number): Promise<GetOrderBookResponse> {
        try {
            const orderBookResponse = await X_OKX_CLIENT.getOrderBook(symbol, limit.toString());
            return {
                lastUpdateId: Number(orderBookResponse[0].ts),
                bids: orderBookResponse[0].bids.map((bid) => bid.map(Number)),
                asks: orderBookResponse[0].asks.map((ask) => ask.map(Number))
            };
        } catch (error) {
            console.error('OKX getOrderBook error:', error);
        }
    }
}
