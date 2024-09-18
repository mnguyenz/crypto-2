import { Injectable } from '@nestjs/common';
import { BaseCommand, Command } from '@hodfords/nestjs-command';
import { BingxOrderService } from '~bingx-api/services/bingx-order.service';
import { MIN_NOTIONAL, X_BINGX_CLIENT } from '~core/constants/bingx.constant';
import { AverageCalculationService } from '~average-calculation/services/average-calculation.service';
import axios from 'axios';
import { FNG_API } from '~core/constants/apis.constant';
import { OkxEarnService } from '~okx-api/services/okx-earn.service';
import { AccountEnum } from '~core/enums/exchanges.enum';
import { ASSETS } from '~core/constants/crypto-code.constant';
import {
    BINGX_OKX_POSTFIX_SYMBOL_USDC,
    BINGX_OKX_POSTFIX_SYMBOL_USDT,
    MAX_FNG_TO_DAILY_BUY
} from '~core/constants/daily-buy.constant';
import { OkxOrderService } from '~okx-api/services/okx-order.service';
import { MAX_TIER_1_USD_EARN } from '~core/constants/okx.constant';
import { OkxMarketService } from '~okx-api/services/okx-market.service';
import { randomPercentage } from '~core/helpers/random.helper';

@Command({
    signature: 'daily-buy',
    description: 'This is command for daily buy crypto',
    options: [
        {
            value: '--asset <asset>',
            description: 'Crypto Asset'
        }
    ]
})
@Injectable()
export class DailyBuyCommand extends BaseCommand {
    constructor(
        private averageCalculationService: AverageCalculationService,
        private bingxOrderService: BingxOrderService,
        private okxEarnService: OkxEarnService,
        private okxOrderService: OkxOrderService,
        private okxMarketService: OkxMarketService
    ) {
        super();
    }

    public async handle(): Promise<void> {
        const options = this.program.opts();
        const { asset } = options;
        try {
            if (asset === ASSETS.CRYPTO.ETH) {
                const usdcXOkxSavings = await this.okxEarnService.getSavingBalance(ASSETS.FIAT.USDC, AccountEnum.X);
                if (usdcXOkxSavings > MAX_TIER_1_USD_EARN + MIN_NOTIONAL) {
                    await this.OkxBuy(asset, AccountEnum.X);
                } else {
                    const usdcMOkxSavings = await this.okxEarnService.getSavingBalance(ASSETS.FIAT.USDC, AccountEnum.M);
                    if (usdcMOkxSavings > MAX_TIER_1_USD_EARN + MIN_NOTIONAL) {
                        await this.OkxBuy(asset, AccountEnum.M);
                    } else {
                        await this.BingXBuy(asset);
                    }
                }
            } else {
                await this.BingXBuy(asset);
            }
        } catch (error) {
            this.error(`Fail Daily Buy. Error: ${error.message}`);
            throw error;
        }
    }

    private async BingXBuy(asset: string) {
        const symbol = `${asset}${BINGX_OKX_POSTFIX_SYMBOL_USDT}`;
        const currentPrice = await X_BINGX_CLIENT.symbolPriceTicker({ symbol });
        if (await this.checkIsBuyOrNot(asset, currentPrice.data[0]?.trades[0].price)) {
            await this.bingxOrderService.buyMarket(symbol);
        }
    }

    private async OkxBuy(asset: string, account?: AccountEnum) {
        const symbol = `${asset}${BINGX_OKX_POSTFIX_SYMBOL_USDC}`;
        const okxOrderBook = await this.okxMarketService.getOrderBook(symbol, 10);
        const currentPrice = okxOrderBook.bids[9][0];
        if (await this.checkIsBuyOrNot(asset, currentPrice)) {
            await this.okxOrderService.buyMinNotional(symbol, currentPrice, account);
        }
    }

    private async checkIsBuyOrNot(asset: string, currentPrice: number): Promise<boolean> {
        const getAverage = await this.averageCalculationService.getAverageByAsset(asset);
        if (getAverage.dcaBuy > currentPrice) {
            return true;
        } else {
            const { data: fngData } = await axios.get(FNG_API);
            const fngIndex = Number(fngData.data[0].value);
            if (fngIndex < MAX_FNG_TO_DAILY_BUY) {
                return true;
            } else {
                return randomPercentage(1, 3);
            }
        }
    }
}
