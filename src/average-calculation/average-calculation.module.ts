import { Module } from '@nestjs/common';
import { AverageCalculationService } from './services/average-calculation.service';
import { TradeRepository } from '~repositories/trade.repository';
import { TypeOrmHelperModule } from '~core/modules/typeorm-module.module';

@Module({
    imports: [TypeOrmHelperModule.forCustomRepository([TradeRepository])],
    controllers: [],
    providers: [AverageCalculationService],
    exports: [AverageCalculationService]
})
export class AverageCalculationModule {}
