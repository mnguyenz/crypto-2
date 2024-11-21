import { Injectable } from '@nestjs/common';
import { BaseCommand, Command } from '@hodfords/nestjs-command';
import { BingxOrderService } from '~bingx-api/services/bingx-order.service';
import { AverageCalculationService } from '~average-calculation/services/average-calculation.service';
import { AccountEnum, ExchangeEnum } from '~core/enums/exchanges.enum';
import { ASSETS } from '~core/constants/crypto-code.constant';
import {
    BINGX_OKX_POSTFIX_SYMBOL_USDC,
    BINGX_OKX_POSTFIX_SYMBOL_USDT,
    MIN_PROFIT_TO_SELL
} from '~core/constants/daily-order.constant';
import { OkxOrderService } from '~okx-api/services/okx-order.service';
import { OkxMarketService } from '~okx-api/services/okx-market.service';

@Command({
    signature: 'daily-sell',
    description: 'This is command for daily sell crypto',
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
export class DailySellCommand extends BaseCommand {
    constructor(
        private averageCalculationService: AverageCalculationService,
        private bingxOrderService: BingxOrderService,
        private okxOrderService: OkxOrderService,
        private okxMarketService: OkxMarketService
    ) {
        super();
    }

    public async handle(): Promise<void> {
        const options = this.program.opts();
        const { asset, exchange } = options;
        try {
            await this.dailySell(asset, exchange, AccountEnum.M);
        } catch (error) {
            this.error(`Fail Daily Sell. Error: ${error.message}`);
            throw error;
        }
    }

    private async dailySell(asset: string, exchange: string, account?: AccountEnum): Promise<void> {
        if (exchange.toUpperCase() === ExchangeEnum.OKX.toUpperCase()) {
            await this.okxSell(asset, true, account);
        }
        // } else {
        //     await this.bingXSell(asset);
        // }
    }

    // private async bingXSell(asset: string): Promise<void> {
    //     const symbol = `${asset}${BINGX_OKX_POSTFIX_SYMBOL_USDT}`;
    //     const currentPrice = await X_BINGX_CLIENT.symbolPriceTicker({ symbol });
    //     if (await this.checkIsSellOrNot(asset, currentPrice.data[0]?.trades[0].price)) {
    //         await this.bingxOrderService.buyMarket(symbol);
    //         if (asset === ASSETS.CRYPTO.ETH) {
    //             await this.bingxOrderService.buyMarket(`${ASSETS.CRYPTO.BTC}${BINGX_OKX_POSTFIX_SYMBOL_USDT}`);
    //         }
    //     }
    // }

    private async okxSell(asset: string, isUsdc: boolean, account?: AccountEnum): Promise<void> {
        let symbol;
        if (isUsdc) {
            symbol = `${asset}${BINGX_OKX_POSTFIX_SYMBOL_USDC}`;
        } else {
            symbol = `${asset}${BINGX_OKX_POSTFIX_SYMBOL_USDT}`;
        }
        const okxOrderBook = await this.okxMarketService.getOrderBook(symbol, 10);
        const currentPrice = okxOrderBook.asks[9][0];
        if (await this.checkIsSellOrNot(asset, currentPrice)) {
            await this.okxOrderService.sellMin(asset, symbol, currentPrice, account);
        }
    }

    private async checkIsSellOrNot(asset: string, currentPrice: number): Promise<boolean> {
        const getAverage = await this.averageCalculationService.getAverageByAsset(asset);
        const targetPrice = asset === ASSETS.CRYPTO.BTC ? getAverage.maxBuy : getAverage.dcaBuyAfterSell;
        return targetPrice * MIN_PROFIT_TO_SELL < currentPrice;
    }
}
