import { Injectable } from '@nestjs/common';
import { BaseCommand, Command } from '@hodfords/nestjs-command';
import { BingxOrderService } from '~bingx-api/services/bingx-order.service';

@Command({
    signature: 'bingx-daily-buy',
    description: 'This is command for daily buy crypto',
    options: [
        {
            value: '--symbol <symbol>',
            description: 'BingX Symbol'
        }
    ]
})
@Injectable()
export class BingxDailyBuyCommand extends BaseCommand {
    constructor(private bingxOrderService: BingxOrderService) {
        super();
    }

    public async handle(): Promise<void> {
        const options = this.program.opts();
        try {
            await this.bingxOrderService.buyMarket(options.symbol);
        } catch (error) {
            this.error(`Fail BingX Daily Buy. Error: ${error.message}`);
            throw error;
        }
    }
}
