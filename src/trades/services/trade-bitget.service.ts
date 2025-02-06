import { Injectable } from '@nestjs/common';
import { OrderSideEnum } from 'bingx-trading-api';
import { M_BITGET_CLIENT, X_BITGET_CLIENT } from '~core/constants/bitget.constant';
import { AccountEnum, ExchangeEnum } from '~core/enums/exchanges.enum';
import { TradeEntity } from '~entities/trade.entity';
import { TradeRepository } from '~repositories/trade.repository';

@Injectable()
export class TradeBitgetService {
    constructor(private tradeRepository: TradeRepository) {}

    async seedTradesBitget(account?: AccountEnum): Promise<void> {
        const client = account === AccountEnum.M ? M_BITGET_CLIENT : X_BITGET_CLIENT;
        const spotHistoricOrders = await client.getSpotHistoricOrders();

        const trades = spotHistoricOrders.data
            .filter((order) => order.status === 'filled')
            .map((order) => {
                const feeDetail = JSON.parse(order.feeDetail as string);
                const feeAssetKey = Object.keys(feeDetail).find(
                    (key) => key !== 'newFees' && feeDetail[key]?.feeCoinCode
                );

                const fee =
                    feeDetail.newFees?.d < 0
                        ? Math.abs(feeDetail.newFees?.d)
                        : feeDetail.newFees?.r < 0
                          ? Math.abs(feeDetail.newFees?.r)
                          : feeDetail[feeAssetKey]?.totalFee;

                return {
                    orderIdReference: order.orderId,
                    tradeTime: order.uTime,
                    asset: order.symbol.substring(0, order.symbol.length - 4),
                    symbol: order.symbol,
                    side: order.side === 'buy' ? OrderSideEnum.BUY : OrderSideEnum.SELL,
                    price: parseFloat(order.priceAvg),
                    quantity: parseFloat(order.baseVolume),
                    fee,
                    feeAsset: feeDetail[feeAssetKey]?.feeCoinCode,
                    exchange: ExchangeEnum.BITGET,
                    account
                };
            }) as unknown as TradeEntity[];
        await this.tradeRepository.upsert(trades, ['orderIdReference', 'exchange']);
    }
}
