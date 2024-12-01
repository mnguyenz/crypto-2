import { Injectable } from '@nestjs/common';
import { OrderSideEnum } from 'bingx-trading-api';
import { HistoricOrder } from 'okx-api';
import { M_OKX_CLIENT, X_OKX_CLIENT } from '~core/constants/okx.constant';
import { AccountEnum, ExchangeEnum } from '~core/enums/exchanges.enum';
import { TradeEntity } from '~entities/trade.entity';
import { TradeRepository } from '~repositories/trade.repository';

@Injectable()
export class TradeOkxService {
    constructor(private tradeRepository: TradeRepository) {}

    async seedTradesOkx(account?: AccountEnum): Promise<void> {
        let allOrders: HistoricOrder[] = [];
        let hasMoreData = true;
        let after: string = undefined;

        while (hasMoreData) {
            const ordersChunk = await this.okxGetOrderHistory(after, account);
            if (ordersChunk.length > 0) {
                allOrders = allOrders.concat(ordersChunk);
                after = ordersChunk[ordersChunk.length - 1].ordId;
            } else {
                hasMoreData = false;
            }
        }
        const trades: TradeEntity[] = allOrders.map(
            (order: HistoricOrder) =>
                ({
                    orderIdReference: order.ordId,
                    tradeTime: BigInt(order.fillTime),
                    asset: order.instId.split('-')[0],
                    symbol: order.instId,
                    side: order.side === 'buy' ? OrderSideEnum.BUY : OrderSideEnum.SELL,
                    price: parseFloat(order.fillPx),
                    quantity: parseFloat(order.fillSz),
                    fee: parseFloat(order.fee.substring(1)),
                    feeAsset: order.feeCcy,
                    exchange: ExchangeEnum.OKX,
                    account
                }) as TradeEntity
        );
        await this.tradeRepository.upsert(trades, ['orderIdReference', 'exchange']);
    }

    okxGetOrderHistory(after?: string, account?: AccountEnum): Promise<HistoricOrder[]> {
        const client = account === AccountEnum.M ? M_OKX_CLIENT : X_OKX_CLIENT;
        return client.getOrderHistoryArchive({ instType: 'SPOT', after });
    }
}
