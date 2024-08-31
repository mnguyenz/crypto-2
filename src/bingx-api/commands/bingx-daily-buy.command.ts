import { Injectable } from '@nestjs/common';
import { BaseCommand, Command } from '@hodfords/nestjs-command';
import { BingxOrderService } from '~bingx-api/services/bingx-order.service';
import { MAX_FNG_TO_DAILY_BUY, X_BINGX_CLIENT } from '~core/constants/bingx.constant';
import { AverageCalculationService } from '~average-calculation/services/average-calculation.service';
import { getAssetFromSymbolBingxOkx } from '~core/helpers/string.helper';
import axios from 'axios';
import { FNG_API } from '~core/constants/apis.constant';

@Command({
    signature: 'bingx-daily-buy',
    description: 'This is command for daily buy crypto',
    options: [
        {
            value: '--symbol <symbol>',
            description: 'BingX Symbol'
        }
    ]
})
@Injectable()
export class BingxDailyBuyCommand extends BaseCommand {
    constructor(
        private bingxOrderService: BingxOrderService,
        private averageCalculationService: AverageCalculationService
    ) {
        super();
    }

    public async handle(): Promise<void> {
        const options = this.program.opts();
        const { symbol } = options;
        try {
            const currentPrice = await X_BINGX_CLIENT.symbolPriceTicker({ symbol });
            const asset = getAssetFromSymbolBingxOkx(symbol);
            const getAverage = await this.averageCalculationService.getAverageByAsset(asset);
            if (getAverage.dcaBuy > currentPrice.data[0]?.trades[0].price) {
                await this.bingxOrderService.buyMarket(options.symbol);
            } else {
                const { data: fngData } = await axios.get(FNG_API);
                const fngIndex = Number(fngData.data[0].value);
                if (fngIndex < MAX_FNG_TO_DAILY_BUY) {
                    await this.bingxOrderService.buyMarket(options.symbol);
                }
            }
        } catch (error) {
            this.error(`Fail BingX Daily Buy. Error: ${error.message}`);
            throw error;
        }
    }
}
