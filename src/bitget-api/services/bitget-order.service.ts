import { Injectable } from '@nestjs/common';
import { M_BITGET_CLIENT, X_BITGET_CLIENT } from '~core/constants/bitget.constant';
import { ASSETS } from '~core/constants/crypto-code.constant';
import { AccountEnum } from '~core/enums/exchanges.enum';
import { delay } from '~core/helpers/time.helper';

@Injectable()
export class BitgetOrderService {
    constructor() {}

    async buyMinimum(symbol: string, account?: AccountEnum): Promise<void> {
        try {
            const client = account === AccountEnum.M ? M_BITGET_CLIENT : X_BITGET_CLIENT;
            const usdtEarnProducts = await client.getEarnSavingsProducts({
                coin: ASSETS.FIAT.USDT,
                filter: 'available'
            });
            const flexibleUsdtProductId = usdtEarnProducts.data.filter(
                (product) => product.periodType === 'flexible'
            )[0].productId;
            await client.earnRedeemSavings({
                productId: flexibleUsdtProductId,
                periodType: 'flexible',
                amount: '1.2'
            });

            await this.waitForUsdtAvailability(ASSETS.FIAT.USDT, account);

            await client.spotSubmitOrder({
                symbol,
                side: 'buy',
                orderType: 'market',
                force: 'gtc',
                size: '1.1'
            });
        } catch (error) {
            console.error('Error buyMarket BitgetOrderService error:', error);
        }
    }

    private async waitForUsdtAvailability(coin: string, account?: AccountEnum) {
        const startTime = Date.now();
        const interval = 1000;
        const timeout = 30000;
        while (Date.now() - startTime < timeout) {
            try {
                const client = account === AccountEnum.M ? M_BITGET_CLIENT : X_BITGET_CLIENT;
                const usdtAssets = await client.getSpotAccountAssets({ coin });
                if (parseFloat(usdtAssets.data[0].available) > 1) {
                    return true;
                }
            } catch (error) {
                console.error('Error BitgetOrderService waitForUsdtAvailability error:', error);
            }
            await delay(interval);
        }
        throw new Error('Timeout waitForUsdtAvailability.');
    }
}
