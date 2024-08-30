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
        let page = 1;
        const perPage = 1;
        await this.dataSource.transaction(async () => {
            try {
                let flag: boolean = true;
                do {
                    const offset = (page - 1) * perPage;
                    const trades = await localConnection.query(
                        `SELECT * FROM "Trade" ORDER BY "tradeTime" DESC LIMIT ${perPage} OFFSET ${offset}`
                    );
                    if (trades.length) {
                        this.tradeRepository.upsert(trades, ['orderIdReference', 'exchange']);
                        this.info(
                            `Inserted ${trades.length} items successfully with page: ${page} and perPage: ${perPage}`
                        );
                        await delay(1000);
                        page++;
                    } else {
                        flag = false;
                    }
                } while (flag);
            } catch (error) {
                this.error(`Fail crawl trade data. Error: ${error.message}`);
                throw error;
            }
        });

        this.success('Crawl trade data successfully!');
    }
}
