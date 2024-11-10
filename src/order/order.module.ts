import { Module } from '@nestjs/common';
import { DailyBuyCommand } from './commands/daily-buy.command';
import { AverageCalculationModule } from '~average-calculation/average-calculation.module';
import { BingxApiModule } from '~bingx-api/bingx-api.module';
import { OkxApiModule } from '~okx-api/okx-api.module';
import { DailySellCommand } from './commands/daily-sell.command';

@Module({
    imports: [AverageCalculationModule, BingxApiModule, OkxApiModule],
    providers: [DailyBuyCommand, DailySellCommand],
    exports: []
})
export class OrderModule {}
