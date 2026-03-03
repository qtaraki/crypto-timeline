import { useState, useEffect, useRef } from 'react';
import type { MergedDataPoint } from '../lib/types';
import { fetchCryptoPrices, fetchYahooETF } from '../lib/api';
import { mergeTimeSeries } from '../lib/mergeTimeSeries';

interface UseMarketDataReturn {
  data: MergedDataPoint[] | null;
  isLoading: boolean;
  error: string | null;
  etfWarning: boolean;
  refetch: () => void;
}

export function useMarketData(days: number): UseMarketDataReturn {
  const [data, setData] = useState<MergedDataPoint[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [etfWarning, setEtfWarning] = useState(false);

  // Monotonic counter — only the latest fetch ID can update state.
  // This is immune to StrictMode double-firing and race conditions.
  const fetchIdRef = useRef(0);

  const fetchData = async () => {
    const id = ++fetchIdRef.current;
    const isStale = () => id !== fetchIdRef.current;

    setIsLoading(true);
    setError(null);
    setEtfWarning(false);

    try {
      const [btcData, ethData, fbtcData, fethData] = await Promise.allSettled([
        fetchCryptoPrices('bitcoin', days),
        fetchCryptoPrices('ethereum', days),
        fetchYahooETF('FBTC', days),
        fetchYahooETF('FETH', days),
      ]);

      if (isStale()) return;

      if (btcData.status === 'rejected' && ethData.status === 'rejected') {
        const reason = btcData.reason?.message || 'All data sources failed';
        setError(`Failed to fetch crypto data: ${reason}`);
        return;
      }

      if (fbtcData.status === 'rejected' || fethData.status === 'rejected') {
        setEtfWarning(true);
      }

      const merged = mergeTimeSeries({ btcData, ethData, fbtcData, fethData });
      setData(merged);
    } catch (err) {
      if (!isStale()) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to fetch market data: ${msg}`);
      }
    } finally {
      if (!isStale()) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
    // Incrementing the counter on cleanup makes the in-flight fetch stale
    return () => { fetchIdRef.current++; };
  }, [days]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, isLoading, error, etfWarning, refetch: fetchData };
}
