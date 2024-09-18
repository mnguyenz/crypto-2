import { OrderSideEnum } from 'bingx-trading-api';
import { OkxRedeemUsdThenOrderParam } from './okx-redeem-usd-then-order.param';

export type OkxNewLimitOrderParam = OkxRedeemUsdThenOrderParam & {
    side: OrderSideEnum;
};
