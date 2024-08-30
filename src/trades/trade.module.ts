import { Module } from '@nestjs/common';
import { TradeRepository } from '~repositories/trade.repository';
import { TradeBingxService } from './services/trade-bingx.service';
import { TradeOkxService } from './services/trade-okx.service';
import { TypeOrmHelperModule } from '~core/modules/typeorm-module.module';

@Module({
    imports: [TypeOrmHelperModule.forCustomRepository([TradeRepository])],
    controllers: [],
    providers: [TradeOkxService, TradeBingxService],
    exports: [TradeOkxService, TradeBingxService]
})
export class TradeModule {}
