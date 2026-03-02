import type { SeriesKey } from './types';

export const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
export const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';
export const DEFAULT_CORS_PROXY = 'https://corsproxy.io/?url=';

export const RANGES = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: '180D', days: 180 },
  { label: '1Y', days: 365 },
] as const;

export const YAHOO_RANGE_MAP: Record<number, string> = {
  7: '7d',
  30: '1mo',
  90: '3mo',
  180: '6mo',
  365: '1y',
};

export const SERIES_CONFIG: Record<
  SeriesKey,
  { label: string; color: string; dashed: boolean }
> = {
  btc: { label: 'Bitcoin (BTC)', color: '#F7931A', dashed: false },
  eth: { label: 'Ethereum (ETH)', color: '#627EEA', dashed: false },
  fbtc: { label: 'FBTC ETF', color: '#FDBA74', dashed: true },
  feth: { label: 'FETH ETF', color: '#A5B4FC', dashed: true },
};
