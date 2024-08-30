import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from '~config/database.config';
import { scheduleConfig } from '~config/schedule.config';
import { TaskModule } from '~tasks/task.module';

@Module({
    imports: [databaseConfig, scheduleConfig, TaskModule],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
