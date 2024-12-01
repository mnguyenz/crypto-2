import { Injectable } from '@nestjs/common';
import { RedeemDestAccount, SubscribeSourceAccount } from '@binance/connector-typescript';
import { M_BINANCE_CLIENT, X_BINANCE_CLIENT } from '~core/constants/binance.constant';
import { AccountEnum } from '~core/enums/exchanges.enum';
import { roundDown } from '~core/helpers/number.util';

@Injectable()
export class BinanceEarnService {
    constructor() {}

    async redeemMaximum(asset: string, account: AccountEnum): Promise<any> {
        try {
            const client = account === AccountEnum.M ? M_BINANCE_CLIENT : X_BINANCE_CLIENT;
            const flexibleProductPosition = await client.getFlexibleProductPosition({ asset });
            if (!flexibleProductPosition.rows.length) {
                return;
            }
            const simpleEarnFlexibleProduct = await client.getSimpleEarnFlexibleProductList({ asset });
            const productId = simpleEarnFlexibleProduct.rows[0].productId;
            return client.redeemFlexibleProduct(productId, {
                redeemAll: true,
                destAccount: RedeemDestAccount.SPOT
            });
        } catch (error) {
            console.error('Binance BinanceEarnService redeemMaximum error:', error);
            return error;
        }
    }

    async lockSavingMaximum(asset: string, account: AccountEnum): Promise<any> {
        try {
            const client = account === AccountEnum.M ? M_BINANCE_CLIENT : X_BINANCE_CLIENT;
            const tradingAssets = await client.userAsset({ asset });
            const fundinggAssets = await client.fundingWallet({ asset });
            const amount = parseFloat(tradingAssets[0]?.free) || 0 + parseFloat(fundinggAssets[0]?.free) || 0;
            if (amount > 0) {
                const simpleEarnLockedProduct = await client.getSimpleEarnLockedProductList({ asset });
                const projectId = simpleEarnLockedProduct.rows[0].projectId;
                return client.subscribeLockedProduct(projectId, roundDown(amount, 8), {
                    autoSubscribe: true,
                    sourceAccount: SubscribeSourceAccount.ALL
                });
            }
        } catch (error) {
            console.error('Binance BinanceEarnService lockSavingMaximum error:', error);
            return error;
        }
    }
}
