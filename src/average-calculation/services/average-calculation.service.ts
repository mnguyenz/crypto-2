import { Injectable } from '@nestjs/common';
import { OrderSideEnum } from 'bingx-trading-api';
import { GetAverageResponse } from '~average-calculation/types/get-average-response.type';
import { ASSETS } from '~core/constants/crypto-code.constant';
import { TradeRepository } from '~repositories/trade.repository';

@Injectable()
export class AverageCalculationService {
    constructor(private tradeRepository: TradeRepository) {}

    async getAverageByAsset(asset: string): Promise<GetAverageResponse> {
        const trades = await this.tradeRepository.find({ where: { asset } });
        if (trades.length === 0) {
            return {
                dcaBuy: 0,
                dcaBuyAfterSell: 0,
                maxBuy: 0,
                buyQuantity: 0,
                buyAmount: 0,
                dcaSell: 0,
                minSell: 0,
                maxSell: 0,
                sellQuantity: 0,
                sellAmount: 0
            };
        }

        const maxBuy = await this.tradeRepository.maximum('price', { asset, side: OrderSideEnum.BUY });
        const minSell = await this.tradeRepository.minimum('price', { asset, side: OrderSideEnum.SELL });
        const maxSell = await this.tradeRepository.maximum('price', { asset, side: OrderSideEnum.SELL });

        const buyTrades = trades.filter((trade) => trade.side === OrderSideEnum.BUY);
        const sellTrades = trades.filter((trade) => trade.side === OrderSideEnum.SELL);

        let totalBuyQuantity: number = 0;
        let totalBuyAmount: number = 0;
        buyTrades.forEach((trade) => {
            const { price, asset, quantity, feeAsset, fee } = trade;
            const finalQuantity = feeAsset === asset ? quantity - fee : +quantity;
            totalBuyQuantity += finalQuantity;
            totalBuyAmount += quantity * price;
        });

        let totalSellQuantity: number = 0;
        let totalSellAmount: number = 0;
        sellTrades.forEach((trade) => {
            const { price, feeAsset, quantity, fee } = trade;
            const finalSellAmount = [ASSETS.FIAT.USDT, ASSETS.FIAT.FDUSD, ASSETS.FIAT.USDC].includes(feeAsset)
                ? quantity * price - fee
                : quantity * price;
            totalSellAmount += finalSellAmount;
            totalSellQuantity += +quantity;
        });

        const dcaBuy = totalBuyAmount / totalBuyQuantity;

        const sortedBuyTrades = [...buyTrades].sort((a, b) => a.price - b.price);
        let remainingSellQuantity = totalSellQuantity;
        let remainingBuyQuantity = 0;
        let remainingBuyAmount = 0;
        for (const trade of sortedBuyTrades) {
            const { price, quantity, asset, feeAsset, fee } = trade;
            const finalQuantity = feeAsset === asset ? Number(quantity) - Number(fee) : Number(quantity);

            if (remainingSellQuantity > 0) {
                if (remainingSellQuantity >= finalQuantity) {
                    remainingSellQuantity -= finalQuantity;
                } else {
                    const partialQuantity = finalQuantity - remainingSellQuantity;
                    const ratio = partialQuantity / finalQuantity;
                    remainingBuyQuantity += partialQuantity;
                    remainingBuyAmount += (partialQuantity + fee * ratio) * price;
                    remainingSellQuantity = 0;
                }
            } else {
                remainingBuyQuantity += finalQuantity;
                remainingBuyAmount += quantity * price;
            }
        }

        const dcaBuyAfterSell = remainingBuyQuantity > 0 ? remainingBuyAmount / remainingBuyQuantity : 0;

        return {
            dcaBuy,
            dcaBuyAfterSell,
            maxBuy,
            buyQuantity: totalBuyQuantity,
            buyAmount: totalBuyAmount,
            dcaSell: totalSellAmount / totalSellQuantity,
            minSell,
            maxSell,
            sellQuantity: totalSellQuantity,
            sellAmount: totalSellAmount
        };
    }
}
