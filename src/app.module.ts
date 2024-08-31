import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from '~config/database.config';
import { scheduleConfig } from '~config/schedule.config';
import { TaskModule } from '~tasks/task.module';
import { commandConfig } from '~config/command.config';
import { BingxApiModule } from '~bingx-api/bingx-api.module';
import { AverageCalculationModule } from '~average-calculation/average-calculation.module';

@Module({
    imports: [commandConfig, databaseConfig, scheduleConfig, AverageCalculationModule, BingxApiModule, TaskModule],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
