import { useState, useEffect, useCallback, useRef } from 'react';
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
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const { signal } = controller;

    setIsLoading(true);
    setError(null);
    setEtfWarning(false);

    try {
      const [btcData, ethData, fbtcData, fethData] = await Promise.allSettled([
        fetchCryptoPrices('bitcoin', days, signal),
        fetchCryptoPrices('ethereum', days, signal),
        fetchYahooETF('FBTC', days, signal),
        fetchYahooETF('FETH', days, signal),
      ]);

      if (signal.aborted) return;

      // If both crypto fetches failed, show error
      if (btcData.status === 'rejected' && ethData.status === 'rejected') {
        const reason = btcData.reason?.message || 'All data sources failed';
        setError(`Failed to fetch crypto data: ${reason}`);
        setIsLoading(false);
        return;
      }

      // If ETF fetches failed, show warning but continue
      if (fbtcData.status === 'rejected' || fethData.status === 'rejected') {
        setEtfWarning(true);
      }

      const merged = mergeTimeSeries({ btcData, ethData, fbtcData, fethData });
      setData(merged);
    } catch (err) {
      if (!signal.aborted) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to fetch market data: ${msg}`);
      }
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [days]);

  useEffect(() => {
    fetchData();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchData]);

  return { data, isLoading, error, etfWarning, refetch: fetchData };
}
