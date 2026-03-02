import type { CoinGeckoResponse, YahooChartResponse } from './types';
import { COINGECKO_BASE, YAHOO_BASE, DEFAULT_CORS_PROXY, YAHOO_RANGE_MAP } from './constants';

const CORS_PROXY = import.meta.env.VITE_CORS_PROXY_URL || DEFAULT_CORS_PROXY;
const CG_API_KEY = import.meta.env.VITE_COINGECKO_API_KEY || '';

export async function fetchCoinGecko(
  coinId: 'bitcoin' | 'ethereum',
  days: number,
): Promise<CoinGeckoResponse> {
  const params = new URLSearchParams({
    vs_currency: 'usd',
    days: String(days),
  });
  if (CG_API_KEY) {
    params.set('x_cg_demo_api_key', CG_API_KEY);
  }
  const url = `${COINGECKO_BASE}/coins/${coinId}/market_chart?${params}`;
  const res = await fetch(url);
  if (res.status === 429) {
    throw new Error('Rate limited by CoinGecko. Please wait a moment and retry.');
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`CoinGecko error ${res.status}: ${body.slice(0, 200)}`);
  }
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
