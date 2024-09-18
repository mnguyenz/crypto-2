import { Module } from '@nestjs/common';
import { TradeRepository } from '~repositories/trade.repository';
import { TradeBingxService } from './services/trade-bingx.service';
import { TradeOkxService } from './services/trade-okx.service';
import { TypeOrmHelperModule } from '~core/modules/typeorm-module.module';
import { CrawlTradeDbCommand } from './commands/crawl-trade-db.command';
import { SeedTradesCommand } from './commands/seed-trades.command';
import { OkxApiModule } from '~okx-api/okx-api.module';

@Module({
    imports: [TypeOrmHelperModule.forCustomRepository([TradeRepository]), OkxApiModule],
    controllers: [],
    providers: [TradeOkxService, TradeBingxService, CrawlTradeDbCommand, SeedTradesCommand],
    exports: [TradeOkxService, TradeBingxService]
})
export class TradeModule {}
