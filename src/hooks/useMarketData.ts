import { useState, useEffect, useCallback, useRef } from 'react';
import type { MergedDataPoint } from '../lib/types';
import { fetchCoinGecko, fetchYahooETF } from '../lib/api';
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
    // Cancel any in-flight request (handles StrictMode double-invoke)
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);
    setEtfWarning(false);

    try {
      // Stagger CoinGecko calls slightly to avoid rate limits
      const btcData = await fetchCoinGecko('bitcoin', days).then(
        (v) => ({ status: 'fulfilled' as const, value: v }),
        (e) => ({ status: 'rejected' as const, reason: e }),
      );

      if (controller.signal.aborted) return;

      const [ethData, fbtcData, fethData] = await Promise.allSettled([
        fetchCoinGecko('ethereum', days),
        fetchYahooETF('FBTC', days),
        fetchYahooETF('FETH', days),
      ]);

      if (controller.signal.aborted) return;

      // If both crypto fetches failed, show the actual error
      if (btcData.status === 'rejected' && ethData.status === 'rejected') {
        const reason = btcData.reason?.message || 'Unknown error';
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
      if (!controller.signal.aborted) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to fetch market data: ${msg}`);
      }
    } finally {
      if (!controller.signal.aborted) {
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
