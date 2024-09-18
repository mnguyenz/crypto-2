import { Injectable } from '@nestjs/common';
import { RestClient } from 'okx-api';
import { M_OKX_CLIENT, X_OKX_CLIENT } from '~core/constants/okx.constant';
import { AccountEnum } from '~core/enums/exchanges.enum';

@Injectable()
export class OkxEarnService {
    constructor() {}

    async getSavingBalance(asset: string, account?: AccountEnum): Promise<number> {
        try {
            let savings;
            if (account === AccountEnum.M) {
                savings = await M_OKX_CLIENT.getSavingBalance(asset);
            } else {
                savings = await X_OKX_CLIENT.getSavingBalance(asset);
            }
            return Number(savings[0].amt);
        } catch (error) {
            console.error('OKX OkxEarnService getSavingBalance error:', error);
        }
    }

    async redeem(asset: string, amount: number, account?: AccountEnum): Promise<void> {
        let client: RestClient;
        if (account === AccountEnum.M) {
            client = M_OKX_CLIENT;
        } else {
            client = X_OKX_CLIENT;
        }
        try {
            await client.savingsPurchaseRedemption(asset, amount.toString(), 'redempt', '0.01');
            await client.fundsTransfer({
                ccy: asset,
                amt: amount.toString(),
                from: '6',
                to: '18',
                type: '0'
            });
        } catch (error) {
            console.error('OKX OkxEarnService redeem error:', error);
        }
    }
}
