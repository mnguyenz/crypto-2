import { Module } from '@nestjs/common';
import { SeedsTask } from './services/seeds.task';
import { TradeModule } from '~trades/trade.module';

@Module({
    imports: [TradeModule],
    controllers: [],
    providers: [SeedsTask],
    exports: []
})
export class TaskModule {}
