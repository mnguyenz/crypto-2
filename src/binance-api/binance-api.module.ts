import { Module } from '@nestjs/common';
import { BinanceSavingCommand } from './commands/binance-saving.command';
import { BinanceEarnService } from './services/binance-earn.service';

@Module({
    imports: [],
    providers: [BinanceSavingCommand, BinanceEarnService],
    exports: []
})
export class BinanceApiModule {}
