import { useState, useEffect, useCallback } from 'react';
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

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setEtfWarning(false);

    try {
      const [btcData, ethData, fbtcData, fethData] = await Promise.allSettled([
        fetchCoinGecko('bitcoin', days),
        fetchCoinGecko('ethereum', days),
        fetchYahooETF('FBTC', days),
        fetchYahooETF('FETH', days),
      ]);

      // If both crypto fetches failed, show error
      if (btcData.status === 'rejected' && ethData.status === 'rejected') {
        setError('Failed to fetch cryptocurrency data. Please try again.');
        setIsLoading(false);
        return;
      }

      // If ETF fetches failed, show warning but continue
      if (fbtcData.status === 'rejected' || fethData.status === 'rejected') {
        setEtfWarning(true);
      }

      const merged = mergeTimeSeries({ btcData, ethData, fbtcData, fethData });
      setData(merged);
    } catch {
      setError('Failed to fetch market data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, etfWarning, refetch: fetchData };
}
