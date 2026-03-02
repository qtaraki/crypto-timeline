import type { CoinGeckoResponse, YahooChartResponse } from './types';
import { COINGECKO_BASE, YAHOO_BASE_DIRECT, YAHOO_BASE_PROXY, YAHOO_RANGE_MAP } from './constants';

const CG_API_KEY = import.meta.env.VITE_COINGECKO_API_KEY || '';
const isDev = import.meta.env.DEV;

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

  // In dev, Vite proxy handles CORS. In prod, try direct (works if served
  // behind a reverse proxy) then fall back to a configurable CORS proxy.
  const base = isDev ? YAHOO_BASE_PROXY : (import.meta.env.VITE_YAHOO_BASE_URL || YAHOO_BASE_DIRECT);
  const url = `${base}/${symbol}?range=${range}&interval=1d`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Yahoo Finance error: ${res.status}`);
  return res.json();
}
