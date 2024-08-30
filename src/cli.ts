import { env } from '~config/env.config';

env.ROOT_PATH = __dirname;

import { CommandService } from '@hodfords/nestjs-command';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '~app.module';
import { commandConfig } from '~config/command.config';

async function startApp() {
    const app = await NestFactory.create(AppModule);
    await app.init();
    const commandService: CommandService = app.select(commandConfig).get(CommandService, { strict: true });
    await commandService.exec();
    await app.close();
}

startApp()
    .then(() => console.log('Init app success'))
    .catch(console.error);
