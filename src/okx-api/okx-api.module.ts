import { Module } from '@nestjs/common';
import { OkxEarnService } from './services/okx-earn.service';
import { OkxMarketService } from './services/okx-market.service';
import { OkxTradeService } from './services/okx-trade.service';
import { OkxOrderService } from './services/okx-order.service';

@Module({
    imports: [],
    controllers: [],
    providers: [OkxEarnService, OkxMarketService, OkxOrderService, OkxTradeService],
    exports: [OkxEarnService, OkxMarketService, OkxOrderService, OkxTradeService]
})
export class OkxApiModule {}
