import { Injectable } from '@nestjs/common';
import { OrderStatusEnum, OrderSideEnum, OrdersResponse, SingleOrderResponse } from 'bingx-trading-api';
import { M_BINGX_CLIENT, X_BINGX_CLIENT } from '~core/constants/bingx.constant';
import { AccountEnum, ExchangeEnum } from '~core/enums/exchanges.enum';
import { TradeEntity } from '~entities/trade.entity';
import { TradeRepository } from '~repositories/trade.repository';

@Injectable()
export class TradeBingxService {
    constructor(private tradeRepository: TradeRepository) {}

    async seedTradesBingx(account?: AccountEnum): Promise<void> {
        let orders: SingleOrderResponse[] = [];
        let queryOrderHistoryResponse: OrdersResponse;
        if (account === AccountEnum.M) {
            queryOrderHistoryResponse = await M_BINGX_CLIENT.queryOrderHistory({
                status: OrderStatusEnum.FILLED
            });
        } else {
            queryOrderHistoryResponse = await X_BINGX_CLIENT.queryOrderHistory({
                status: OrderStatusEnum.FILLED
            });
        }
        orders = queryOrderHistoryResponse.data?.orders;

        const trades = orders.map((order: SingleOrderResponse) => ({
            orderIdReference: order.orderId,
            tradeTime: order.time,
            asset: order.symbol.split('-')[0],
            symbol: order.symbol,
            side: order.side === OrderSideEnum.BUY ? OrderSideEnum.BUY : OrderSideEnum.SELL,
            price: order.price,
            quantity: order.executedQty,
            fee: Math.abs(order.fee),
            feeAsset: order.symbol.split('-')[0],
            exchange: ExchangeEnum.BINGX,
            account
        })) as unknown as TradeEntity[];
        await this.tradeRepository.upsert(trades, ['orderIdReference', 'exchange']);
    }
}
