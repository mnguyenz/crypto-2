import { Injectable } from '@nestjs/common';
import { BaseCommand, Command } from '@hodfords/nestjs-command';
import { BingxOrderService } from '~bingx-api/services/bingx-order.service';
import { MIN_NOTIONAL, X_BINGX_CLIENT } from '~core/constants/bingx.constant';
import { AverageCalculationService } from '~average-calculation/services/average-calculation.service';
import axios from 'axios';
import { FNG_API } from '~core/constants/apis.constant';
import { OkxEarnService } from '~okx-api/services/okx-earn.service';
import { AccountEnum, ExchangeEnum } from '~core/enums/exchanges.enum';
import { ASSETS } from '~core/constants/crypto-code.constant';
import {
    BINGX_OKX_POSTFIX_SYMBOL_USDC,
    BINGX_OKX_POSTFIX_SYMBOL_USDT,
    BITGET_POSTFIX_SYMBOL_USDT,
    MAX_FNG_TO_DAILY_BUY
} from '~core/constants/daily-order.constant';
import { OkxOrderService } from '~okx-api/services/okx-order.service';
import { OkxMarketService } from '~okx-api/services/okx-market.service';
import { randomPercentage } from '~core/helpers/random.helper';
import { BitgetOrderService } from '~bitget-api/services/bitget-order.service';
import { BITGET_PUBLIC_CLIENT } from '~core/constants/bitget.constant';

@Command({
    signature: 'daily-buy',
    description: 'This is command for daily buy crypto',
    options: [
        {
            value: '--asset <asset>',
            description: 'Crypto Asset'
        },
        {
            value: '--exchange <exchange>',
            description: 'Crypto Exchange'
        }
    ]
})
@Injectable()
export class DailyBuyCommand extends BaseCommand {
    constructor(
        private averageCalculationService: AverageCalculationService,
        private bingxOrderService: BingxOrderService,
        private bitgetOrderService: BitgetOrderService,
        private okxEarnService: OkxEarnService,
        private okxOrderService: OkxOrderService,
        private okxMarketService: OkxMarketService
    ) {
        super();
    }

    public async handle(): Promise<void> {
        const options = this.program.opts();
        const { asset, exchange } = options;
        try {
            await this.dailyBuy(asset || ASSETS.CRYPTO.BTC, exchange || ExchangeEnum.BITGET, AccountEnum.X);
        } catch (error) {
            this.error(`Fail Daily Buy. Error: ${error.message}`);
            throw error;
        }
    }

    private async dailyBuy(asset: string, exchange: string, account?: AccountEnum): Promise<void> {
        if (exchange.toUpperCase() === ExchangeEnum.OKX.toUpperCase()) {
            await this.okxBuy(asset, false, account);
        } else if (exchange.toUpperCase() === ExchangeEnum.BINGX.toUpperCase()) {
            await this.bingxBuy(asset);
        } else {
            await this.bitgetBuy(asset, account);
        }
    }

    private async bingxBuy(asset: string): Promise<void> {
        const symbol = `${asset}${BINGX_OKX_POSTFIX_SYMBOL_USDT}`;
        const currentPrice = await X_BINGX_CLIENT.symbolPriceTicker({ symbol });
        if (await this.checkIsBuyOrNot(asset, currentPrice.data[0]?.trades[0].price)) {
            await this.bingxOrderService.buyMarket(symbol);
        }
    }

    private async bitgetBuy(asset: string, account?: AccountEnum): Promise<void> {
        const symbol = `${asset}${BITGET_POSTFIX_SYMBOL_USDT}`;
        const tickerResponse = await BITGET_PUBLIC_CLIENT.getSpotTicker({ symbol });
        if (tickerResponse.data.length > 0) {
            const currentPrice = parseFloat(tickerResponse.data[0].askPr);
            if (await this.checkIsBuyOrNot(asset, currentPrice)) {
                await this.bitgetOrderService.buyMinimum(symbol, account);
            }
        }
    }

    private async okxBuy(asset: string, isUsdc: boolean, account?: AccountEnum): Promise<void> {
        let symbol;
        if (isUsdc) {
            symbol = `${asset}${BINGX_OKX_POSTFIX_SYMBOL_USDC}`;
        } else {
            symbol = `${asset}${BINGX_OKX_POSTFIX_SYMBOL_USDT}`;
        }
        const okxOrderBook = await this.okxMarketService.getOrderBook(symbol, 10);
        const currentPrice = okxOrderBook.bids[9][0];
        if (await this.checkIsBuyOrNot(asset, currentPrice)) {
            await this.okxOrderService.buyMinNotional(symbol, currentPrice, account);
        }
    }

    private async checkIsBuyOrNot(asset: string, currentPrice: number): Promise<boolean> {
        const getAverage = await this.averageCalculationService.getAverageByAsset(asset);
        if (getAverage.dcaBuyAfterSell > currentPrice) {
            return true;
        } else {
            if (getAverage.maxBuy < currentPrice || asset !== ASSETS.CRYPTO.BTC) {
                return false;
            }
            return true;
        }
    }
}
