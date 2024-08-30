import { Spot } from 'bingx-trading-api';
import { env } from '~config/env.config';

export const M_BINGX_CLIENT = new Spot(env.BINGX.M_API_KEY, env.BINGX.M_API_SECRET);
export const X_BINGX_CLIENT = new Spot(env.BINGX.X_API_KEY, env.BINGX.X_API_SECRET);
