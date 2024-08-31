import { Injectable } from '@nestjs/common';
import { BaseCommand, Command } from '@hodfords/nestjs-command';
import { DataSource } from 'typeorm';
import { TradeRepository } from '~repositories/trade.repository';
import { delay } from '~core/helpers/time.helper';

@Command({
    signature: 'crawl-trade-db',
    description: 'This is crawl trade DB on local'
})
@Injectable()
export class CrawlTradeDbCommand extends BaseCommand {
    private localConnection: DataSource;

    constructor(
        private dataSource: DataSource,
        private tradeRepository: TradeRepository
    ) {
        super();
    }

    public async handle(): Promise<void> {
        await this.initLocalConnection();
        await this.crawlDatas(this.localConnection);
        await this.localConnection.destroy();
    }

    private async initLocalConnection() {
        this.localConnection = new DataSource({
            type: 'postgres',
            port: 5432,
            host: 'localhost',
            username: 'postgres',
            password: '123',
            database: 'crypto-1',
            name: 'migration'
        });
        await this.localConnection.initialize();
    }

    private async crawlDatas(localConnection: DataSource) {
        await this.dataSource.transaction(async () => {
            try {
                const crawledTrades = await this.tradeRepository.find();
                const crawledTradeIds = crawledTrades.map((trade) => trade.orderIdReference);
                const trades = await localConnection.query(`SELECT * FROM "Trade"`);
                const notCrawledTrades = trades.filter((trade) => !crawledTradeIds.includes(trade.orderIdReference));
                for (const trade of notCrawledTrades) {
                    await this.tradeRepository.save(trade);
                    await delay(1000);
                }
            } catch (error) {
                this.error(`Fail crawl trade data. Error: ${error.message}`);
                throw error;
            }
        });

        this.success('Crawl trade data successfully!');
    }
}
