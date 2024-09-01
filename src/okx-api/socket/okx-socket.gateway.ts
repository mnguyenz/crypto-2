import { Injectable, OnModuleInit } from '@nestjs/common';
import { WebsocketClient } from 'okx-api';

@Injectable()
export class OkxSocketGateway implements OnModuleInit {
    private client: WebsocketClient;

    constructor() {}

    async onModuleInit() {
        this.client = new WebsocketClient({});
        this.client.on('update', (data) => {
            console.log('MinhDebug OkxSocketGateway data', data);
        });
        this.client.subscribe({
            channel: 'tickers',
            instId: 'BTC-USDT'
        });
    }
}
