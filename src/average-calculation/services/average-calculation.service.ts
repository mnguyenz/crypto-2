import { Injectable } from '@nestjs/common';
import { OrderSideEnum } from 'bingx-trading-api';
import { GetAverageResponse } from '~average-calculation/types/get-average-response.type';
import { ASSETS } from '~core/constants/crypto-code.constant';
import { TradeRepository } from '~repositories/trade.repository';

@Injectable()
export class AverageCalculationService {
    constructor(private tradeRepository: TradeRepository) {}

    async getAverageByAsset(asset: string): Promise<GetAverageResponse> {
        const maxBuy = await this.tradeRepository.maximum('price', { asset, side: OrderSideEnum.BUY });
        const minSell = await this.tradeRepository.minimum('price', { asset, side: OrderSideEnum.SELL });
        const trades = await this.tradeRepository.find({ where: { asset } });
        if (trades.length === 0) {
            return {
                dcaBuy: 0,
                maxBuy: 0,
                buyQuantity: 0,
                buyAmount: 0,
                dcaSell: 0,
                minSell: 0,
                sellQuantity: 0,
                sellAmount: 0
            };
        }

        const buyTrades = trades.filter((trade) => trade.side === OrderSideEnum.BUY);
        let totalBuyQuantity: number = 0;
        let totalBuyAmount: number = 0;
        buyTrades.forEach((trade) => {
            const { price, asset, quantity, feeAsset, fee } = trade;
            if (feeAsset === asset) {
                totalBuyQuantity += quantity - fee;
            } else {
                totalBuyQuantity += quantity;
            }
            totalBuyAmount += quantity * price;
        });

        const sellTrades = trades.filter((trade) => trade.side === OrderSideEnum.SELL);
        let totalSellQuantity: number = 0;
        let totalSellAmount: number = 0;
        sellTrades.forEach((trade) => {
            const { price, feeAsset, quantity, fee } = trade;
            if ([ASSETS.FIAT.USDT, ASSETS.FIAT.FDUSD, ASSETS.FIAT.USDC].includes(feeAsset)) {
                totalSellAmount += quantity * price - fee;
            } else {
                totalSellAmount += quantity * price;
            }
            totalSellQuantity = +quantity;
        });

        return {
            dcaBuy: totalBuyAmount / totalBuyQuantity,
            maxBuy,
            buyQuantity: totalBuyQuantity,
            buyAmount: totalBuyAmount,
            dcaSell: totalSellAmount / totalSellQuantity,
            minSell,
            sellQuantity: totalSellQuantity,
            sellAmount: totalSellAmount
        };
    }
}
