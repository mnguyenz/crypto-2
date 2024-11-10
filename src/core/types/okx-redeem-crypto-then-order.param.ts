import { OkxRedeemUsdThenOrderParam } from './okx-redeem-usd-then-order.param';

export type OkxRedeemCryptoThenOrderParam = OkxRedeemUsdThenOrderParam & {
    asset: string;
};
