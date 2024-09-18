import { Module } from '@nestjs/common';
import { BingxOrderService } from './services/bingx-order.service';
import { AverageCalculationModule } from '~average-calculation/average-calculation.module';

@Module({
    imports: [AverageCalculationModule],
    providers: [BingxOrderService],
    exports: [BingxOrderService]
})
export class BingxApiModule {}
