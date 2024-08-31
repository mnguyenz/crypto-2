import { Injectable } from '@nestjs/common';
import { OrderSideEnum } from 'bingx-trading-api';
import { getAverageResponse } from '~average-calculation/types/get-average-response.type';
import { TradeRepository } from '~repositories/trade.repository';

@Injectable()
export class AverageCalculationService {
    constructor(private tradeRepository: TradeRepository) {}

    async getAverageByAsset(asset: string): Promise<getAverageResponse> {
        const trades = await this.tradeRepository.find({ where: { asset } });
        const maxBuy = await this.tradeRepository.maximum('price', { asset });

        if (trades.length === 0) {
            return {
                dcaBuy: 0,
                maxBuy: 0
            };
        }
        const buyTrades = trades.filter((trade) => trade.side === OrderSideEnum.BUY);
        let totalBuyQuantity: number = 0;
        let totalBuyAmount: number = 0;
        buyTrades.forEach((trade) => {
            const { feeAsset, asset, quantity, fee } = trade;
            if (feeAsset === asset) {
                totalBuyQuantity += quantity - fee;
            } else {
                totalBuyQuantity += trade.quantity;
            }
            totalBuyAmount += trade.quantity * trade.price;
        });

        return {
            dcaBuy: totalBuyAmount / totalBuyQuantity,
            maxBuy
        };
    }
}
