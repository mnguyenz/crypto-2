import { Module } from '@nestjs/common';
import { BingxOrderService } from './services/bingx-order.service';
import { BingxDailyBuyCommand } from './commands/bingx-daily-buy.command';
import { AverageCalculationModule } from '~average-calculation/average-calculation.module';

@Module({
    imports: [AverageCalculationModule],
    providers: [BingxOrderService, BingxDailyBuyCommand],
    exports: [BingxOrderService]
})
export class BingxApiModule {}
