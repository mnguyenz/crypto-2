import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AccountEnum } from '~core/enums/exchanges.enum';
import { TradeBingxService } from '~trades/services/trade-bingx.service';
import { TradeOkxService } from '~trades/services/trade-okx.service';

@Injectable()
export class SeedsTask {
    constructor(
        private tradeOkxService: TradeOkxService,
        private tradeBingxService: TradeBingxService
    ) {}

    @Cron(CronExpression.EVERY_10_SECONDS)
    async seedTradesBingx(): Promise<void> {
        console.log('MinhDebug x');
        await this.tradeOkxService.seedTradesOkx(AccountEnum.M);
        await this.tradeOkxService.seedTradesOkx(AccountEnum.X);
        await this.tradeBingxService.seedTradesBingx(AccountEnum.M);
        await this.tradeBingxService.seedTradesBingx(AccountEnum.X);
    }
}
