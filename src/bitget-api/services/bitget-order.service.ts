import { Injectable } from '@nestjs/common';
import { M_BITGET_CLIENT } from '~core/constants/bitget.constant';
import { ASSETS } from '~core/constants/crypto-code.constant';
import { AccountEnum } from '~core/enums/exchanges.enum';
import { delay } from '~core/helpers/time.helper';

@Injectable()
export class BitgetOrderService {
    constructor() {}

    async buyMinimum(symbol: string, account?: AccountEnum): Promise<void> {
        try {
            const usdtEarnProducts = await M_BITGET_CLIENT.getEarnSavingsProducts({
                coin: ASSETS.FIAT.USDT,
                filter: 'available'
            });
            const flexibleUsdtProductId = usdtEarnProducts.data.filter(
                (product) => product.periodType === 'flexible'
            )[0].productId;
            await M_BITGET_CLIENT.earnRedeemSavings({
                productId: flexibleUsdtProductId,
                periodType: 'flexible',
                amount: '1.1'
            });
            await delay(6000);

            await M_BITGET_CLIENT.spotSubmitOrder({
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
}
