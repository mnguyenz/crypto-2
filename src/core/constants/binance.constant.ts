import { Spot } from '@binance/connector-typescript';
import { env } from '~config/env.config';

export const X_BINANCE_CLIENT = new Spot(env.BINANCE.M_API_KEY, env.BINANCE.M_API_SECRET, {
    baseURL: env.BINANCE.API_URL
});

export const M_BINANCE_CLIENT = new Spot(env.BINANCE.M_API_KEY, env.BINANCE.M_API_SECRET, {
    baseURL: env.BINANCE.API_URL
});
