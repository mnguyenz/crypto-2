import { RestClient } from 'okx-api';
import { env } from '~config/env.config';

export const M_OKX_CLIENT = new RestClient({
    apiKey: env.OKX.M_API_KEY,
    apiSecret: env.OKX.M_API_SECRET,
    apiPass: env.OKX.M_API_PASS
});

export const X_OKX_CLIENT = new RestClient({
    apiKey: env.OKX.X_API_KEY,
    apiSecret: env.OKX.X_API_SECRET,
    apiPass: env.OKX.X_API_PASS
});

export const OKX_POSTFIX_SYMBOL_USDT = '-USDT';

export const OKX_MIN_SAVING_BTC_ETH = 0.0001;
