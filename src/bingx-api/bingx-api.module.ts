import { Module } from '@nestjs/common';
import { BingxOrderService } from './services/bingx-order.service';
import { BingxDailyBuyCommand } from './commands/bingx-daily-buy.command';

@Module({
    imports: [],
    providers: [BingxOrderService, BingxDailyBuyCommand],
    exports: [BingxOrderService]
})
export class BingxApiModule {}
