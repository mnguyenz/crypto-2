import { Injectable } from '@nestjs/common';
import { BaseCommand, Command } from '@hodfords/nestjs-command';
import { DataSource } from 'typeorm';
import { AccountEnum } from '~core/enums/exchanges.enum';
import { TradeBingxService } from '~trades/services/trade-bingx.service';
import { TradeOkxService } from '~trades/services/trade-okx.service';
import { OkxEarnService } from '~okx-api/services/okx-earn.service';
import { ASSETS } from '~core/constants/crypto-code.constant';

@Command({
    signature: 'seed-trades',
    description: 'This is seed trades on exchanges command'
})
@Injectable()
export class SeedTradesCommand extends BaseCommand {
    constructor(
        private dataSource: DataSource,
        private tradeBingxService: TradeBingxService,
        private tradeOkxService: TradeOkxService,
        private okxEarnService: OkxEarnService
    ) {
        super();
    }

    public async handle(): Promise<void> {
        await this.seedTrades();
        await this.purchaseMaxToSaving();
    }

    private async seedTrades() {
        await this.dataSource.transaction(async () => {
            try {
                await this.tradeBingxService.seedTradesBingx(AccountEnum.X);
                await this.tradeBingxService.seedTradesBingx(AccountEnum.M);
                await this.tradeOkxService.seedTradesOkx(AccountEnum.X);
                await this.tradeOkxService.seedTradesOkx(AccountEnum.M);
            } catch (error) {
                this.error(`Fail seed trades data. Error: ${error.message}`);
                throw error;
            }
        });

        this.success('Seed trades data successfully!');
    }

    private async purchaseMaxToSaving() {
        await this.okxEarnService.purchaseMaxToSaving(ASSETS.CRYPTO.ETH, AccountEnum.X);
        await this.okxEarnService.purchaseMaxToSaving(ASSETS.CRYPTO.ETH, AccountEnum.M);
    }
}
