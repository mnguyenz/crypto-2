import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from '~config/database.config';
import { scheduleConfig } from '~config/schedule.config';
import { TaskModule } from '~tasks/task.module';
import { commandConfig } from '~config/command.config';
import { BingxApiModule } from '~bingx-api/bingx-api.module';
import { AverageCalculationModule } from '~average-calculation/average-calculation.module';
import { OrderModule } from '~order/order.module';
import { OkxApiModule } from '~okx-api/okx-api.module';
import { BinanceApiModule } from '~binance-api/binance-api.module';
import { BitgetApiModule } from '~bitget-api/bitget-api.module';

@Module({
    imports: [
        commandConfig,
        databaseConfig,
        scheduleConfig,
        AverageCalculationModule,
        BinanceApiModule,
        BingxApiModule,
        BitgetApiModule,
        TaskModule,
        OrderModule,
        OkxApiModule
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
