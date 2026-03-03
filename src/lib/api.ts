import type { PriceSeries, YahooChartResponse } from './types';
import { YAHOO_BASE_DIRECT, YAHOO_BASE_PROXY, YAHOO_RANGE_MAP } from './constants';

const isDev = import.meta.env.DEV;

// ---------------------------------------------------------------------------
// Crypto: fallback chain  CoinGecko → CryptoCompare
// All free, no API key, browser CORS supported.
// ---------------------------------------------------------------------------

const CRYPTO_SYMBOLS = {
  bitcoin: { coingecko: 'bitcoin', cryptocompare: 'BTC' },
  ethereum: { coingecko: 'ethereum', cryptocompare: 'ETH' },
} as const;

type CoinId = keyof typeof CRYPTO_SYMBOLS;

/** Try each source in order, return the first that succeeds. */
export async function fetchCryptoPrices(
  coinId: CoinId,
  days: number,
  signal?: AbortSignal,
): Promise<PriceSeries> {
  const sources = [
    () => fetchFromCoinGecko(coinId, days, signal),
    () => fetchFromCryptoCompare(coinId, days, signal),
  ];

  let lastError: Error | null = null;
  for (const source of sources) {
    // Stop trying if the request was cancelled
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    try {
      const result = await source();
      if (result.length > 0) return result;
    } catch (err) {
      // Don't catch abort errors — propagate them immediately
      if (err instanceof DOMException && err.name === 'AbortError') throw err;
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }
  throw lastError ?? new Error('All crypto data sources failed');
}

// --- CoinGecko (free, no key, CORS) ---

async function fetchFromCoinGecko(
  coinId: CoinId,
  days: number,
  signal?: AbortSignal,
): Promise<PriceSeries> {
  const id = CRYPTO_SYMBOLS[coinId].coingecko;
  const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
  const data: { prices: [number, number][] } = await res.json();
  return dedupeByDate(data.prices.map(([ts, price]) => [msToDate(ts), price]));
}

// --- CryptoCompare (free, no key, CORS) ---

interface CryptoCompareDay {
  time: number; // unix seconds
  close: number;
}

async function fetchFromCryptoCompare(
  coinId: CoinId,
  days: number,
  signal?: AbortSignal,
): Promise<PriceSeries> {
  const fsym = CRYPTO_SYMBOLS[coinId].cryptocompare;
  const url = `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${fsym}&tsym=USD&limit=${days}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`CryptoCompare ${res.status}`);
  const json: { Response: string; Data: { Data: CryptoCompareDay[] } } = await res.json();
  if (json.Response !== 'Success') throw new Error('CryptoCompare returned error');
  return json.Data.Data.map((d) => [secToDate(d.time), d.close]);
}

// ---------------------------------------------------------------------------
// ETFs: Yahoo Finance (via Vite proxy in dev)
// ---------------------------------------------------------------------------

export async function fetchYahooETF(
  symbol: 'FBTC' | 'FETH',
  days: number,
  signal?: AbortSignal,
): Promise<YahooChartResponse> {
  const range = YAHOO_RANGE_MAP[days] || '1mo';
  const base = isDev
    ? YAHOO_BASE_PROXY
    : (import.meta.env.VITE_YAHOO_BASE_URL || YAHOO_BASE_DIRECT);
  const url = `${base}/${symbol}?range=${range}&interval=1d`;
  const res = await fetch(url, { signal });
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

/** Keep only the last price per date. */
function dedupeByDate(series: PriceSeries): PriceSeries {
  const map = new Map<string, number>();
  for (const [date, price] of series) {
    map.set(date, price);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}
