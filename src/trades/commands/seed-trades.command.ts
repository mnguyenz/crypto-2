import { Injectable } from '@nestjs/common';
import { BaseCommand, Command } from '@hodfords/nestjs-command';
import { DataSource } from 'typeorm';
import { AccountEnum } from '~core/enums/exchanges.enum';
import { TradeBingxService } from '~trades/services/trade-bingx.service';

@Command({
    signature: 'seed-trades',
    description: 'This is seed trades on exchanges command'
})
@Injectable()
export class SeedTradesCommand extends BaseCommand {
    constructor(
        private dataSource: DataSource,
        private tradeBingxService: TradeBingxService
    ) {
        super();
    }

    public async handle(): Promise<void> {
        await this.seedTrades();
    }

    private async seedTrades() {
        await this.dataSource.transaction(async () => {
            try {
                await this.tradeBingxService.seedTradesBingx(AccountEnum.X);
                await this.tradeBingxService.seedTradesBingx(AccountEnum.M);
            } catch (error) {
                this.error(`Fail seed trades data. Error: ${error.message}`);
                throw error;
            }
        });

        this.success('Seed trades data successfully!');
    }
}