import type { CoinGeckoResponse, YahooChartResponse } from './types';
import { COINGECKO_BASE, YAHOO_BASE, DEFAULT_CORS_PROXY, YAHOO_RANGE_MAP } from './constants';

const CORS_PROXY = import.meta.env.VITE_CORS_PROXY_URL || DEFAULT_CORS_PROXY;

export async function fetchCoinGecko(
  coinId: 'bitcoin' | 'ethereum',
  days: number,
): Promise<CoinGeckoResponse> {
  const url = `${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);
  return res.json();
}

export async function fetchYahooETF(
  symbol: 'FBTC' | 'FETH',
  days: number,
): Promise<YahooChartResponse> {
  const range = YAHOO_RANGE_MAP[days] || '1mo';
  const targetUrl = `${YAHOO_BASE}/${symbol}?range=${range}&interval=1d`;
  const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(targetUrl)}`;
  const res = await fetch(proxiedUrl);
  if (!res.ok) throw new Error(`Yahoo Finance error: ${res.status}`);
  return res.json();
}
