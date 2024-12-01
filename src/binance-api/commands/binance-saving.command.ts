import { Injectable } from '@nestjs/common';
import { BaseCommand, Command } from '@hodfords/nestjs-command';
import { ASSETS } from '~core/constants/crypto-code.constant';
import { BinanceEarnService } from '~binance-api/services/binance-earn.service';
import { AccountEnum } from '~core/enums/exchanges.enum';
import { delay } from '~core/helpers/time.helper';

@Command({
    signature: 'binance-saving',
    description: 'Put Assets on Binance Saving'
})
@Injectable()
export class BinanceSavingCommand extends BaseCommand {
    constructor(private binanceEarnService: BinanceEarnService) {
        super();
    }

    public async handle(): Promise<void> {
        await this.purchaseMaxToXAccountSaving();
    }

    private async purchaseMaxToXAccountSaving() {
        await this.binanceEarnService.redeemMaximum(ASSETS.FIAT.FDUSD, AccountEnum.M);
        await this.binanceEarnService.redeemMaximum(ASSETS.FIAT.FDUSD, AccountEnum.X);
        await delay(1000);
        await this.binanceEarnService.lockSavingMaximum(ASSETS.FIAT.FDUSD, AccountEnum.M);
        await this.binanceEarnService.lockSavingMaximum(ASSETS.FIAT.FDUSD, AccountEnum.X);
    }
}
