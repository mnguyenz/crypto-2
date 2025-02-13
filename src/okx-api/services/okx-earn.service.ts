import { Injectable } from '@nestjs/common';
import { RestClient } from 'okx-api';
import { ASSETS } from '~core/constants/crypto-code.constant';
import { M_OKX_CLIENT, OKX_MIN_SAVING_BTC_ETH, OKX_MIN_SAVING_USD, X_OKX_CLIENT } from '~core/constants/okx.constant';
import { AccountEnum } from '~core/enums/exchanges.enum';

@Injectable()
export class OkxEarnService {
    constructor() {}

    async getSavingBalance(asset: string, account?: AccountEnum): Promise<number> {
        try {
            const client = account === AccountEnum.M ? M_OKX_CLIENT : X_OKX_CLIENT;
            const savings = await client.getSavingBalance(asset);
            return Number(savings[0].amt);
        } catch (error) {
            console.error('OKX OkxEarnService getSavingBalance error:', error);
        }
    }

    async redeem(asset: string, amount: number, account?: AccountEnum): Promise<void> {
        const client = account === AccountEnum.M ? M_OKX_CLIENT : X_OKX_CLIENT;
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

    async purchaseMaxToSaving(asset: string, account?: AccountEnum): Promise<void> {
        try {
            const client = account === AccountEnum.M ? M_OKX_CLIENT : X_OKX_CLIENT;
            const balance = await client.getBalance(asset);
            const amount = balance[0].details[0]?.availBal;
            if (
                (asset === ASSETS.CRYPTO.BTC || asset === ASSETS.CRYPTO.ETH) &&
                parseFloat(amount) >= OKX_MIN_SAVING_BTC_ETH
            ) {
                await client.fundsTransfer({
                    ccy: asset,
                    amt: amount,
                    from: '18',
                    to: '6',
                    type: '0'
                });
            }
            if (
                (asset === ASSETS.FIAT.USDT || asset === ASSETS.FIAT.USDC) &&
                parseFloat(amount) >= OKX_MIN_SAVING_USD
            ) {
                await client.fundsTransfer({
                    ccy: asset,
                    amt: amount,
                    from: '18',
                    to: '6',
                    type: '0'
                });
            }
            await client.savingsPurchaseRedemption(asset, amount, 'purchase', '0.01');
        } catch (error) {
            console.error('OKX OkxEarnService purchaseMaxToSaving error:', error);
        }
    }
}
