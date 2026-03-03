import type { PriceSeries, YahooChartResponse } from './types';
import { YAHOO_RANGE_MAP } from './constants';

const isDev = import.meta.env.DEV;

const COINGECKO_BASE = isDev
  ? '/api/coingecko/api/v3'
  : 'https://api.coingecko.com/api/v3';

const CRYPTOCOMPARE_BASE = isDev
  ? '/api/cryptocompare'
  : 'https://min-api.cryptocompare.com';

const YAHOO_BASE = isDev
  ? '/api/yahoo/v8/finance/chart'
  : 'https://query1.finance.yahoo.com/v8/finance/chart';

// ---------------------------------------------------------------------------
// Crypto: fallback chain  CoinGecko → CryptoCompare
// ---------------------------------------------------------------------------

const CRYPTO_SYMBOLS = {
  bitcoin: { coingecko: 'bitcoin', cryptocompare: 'BTC' },
  ethereum: { coingecko: 'ethereum', cryptocompare: 'ETH' },
} as const;

type CoinId = keyof typeof CRYPTO_SYMBOLS;

/** Try each source in order, return the first that succeeds. */
export async function fetchCryptoPrices(coinId: CoinId, days: number): Promise<PriceSeries> {
  const sources = [
    () => fetchFromCoinGecko(coinId, days),
    () => fetchFromCryptoCompare(coinId, days),
  ];

  let lastError: Error | null = null;
  for (const source of sources) {
    try {
      const result = await source();
      if (result.length > 0) return result;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }
  throw lastError ?? new Error('All crypto data sources failed');
}

// --- CoinGecko ---

async function fetchFromCoinGecko(coinId: CoinId, days: number): Promise<PriceSeries> {
  const id = CRYPTO_SYMBOLS[coinId].coingecko;
  const url = `${COINGECKO_BASE}/coins/${id}/market_chart?vs_currency=usd&days=${days}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
  const data: { prices: [number, number][] } = await res.json();
  return dedupeByDate(data.prices.map(([ts, price]) => [msToDate(ts), price]));
}

// --- CryptoCompare ---

interface CryptoCompareDay {
  time: number;
  close: number;
}

async function fetchFromCryptoCompare(coinId: CoinId, days: number): Promise<PriceSeries> {
  const fsym = CRYPTO_SYMBOLS[coinId].cryptocompare;
  const url = `${CRYPTOCOMPARE_BASE}/data/v2/histoday?fsym=${fsym}&tsym=USD&limit=${days}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CryptoCompare ${res.status}`);
  const json: { Response: string; Data: { Data: CryptoCompareDay[] } } = await res.json();
  if (json.Response !== 'Success') throw new Error('CryptoCompare returned error');
  return json.Data.Data.map((d) => [secToDate(d.time), d.close]);
}

// ---------------------------------------------------------------------------
// ETFs: Yahoo Finance
// ---------------------------------------------------------------------------

export async function fetchYahooETF(
  symbol: 'FBTC' | 'FETH',
  days: number,
): Promise<YahooChartResponse> {
  const range = YAHOO_RANGE_MAP[days] || '1mo';
  const url = `${YAHOO_BASE}/${symbol}?range=${range}&interval=1d`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Yahoo Finance ${res.status}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function msToDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

function secToDate(sec: number): string {
  return new Date(sec * 1000).toISOString().slice(0, 10);
}

function dedupeByDate(series: PriceSeries): PriceSeries {
  const map = new Map<string, number>();
  for (const [date, price] of series) {
    map.set(date, price);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}
