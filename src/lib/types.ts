export interface MergedDataPoint {
  date: string;
  btc?: number;
  eth?: number;
  fbtc?: number;
  feth?: number;
}

export interface CoinGeckoResponse {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface YahooChartResponse {
  chart: {
    result: [
      {
        timestamp: number[];
        indicators: {
          quote: [
            {
              close: (number | null)[];
            },
          ];
        };
      },
    ];
    error: null | { code: string; description: string };
  };
}

export type ViewMode = 'price' | 'percent';

export type SeriesKey = 'btc' | 'eth' | 'fbtc' | 'feth';

export type VisibleSeries = Record<SeriesKey, boolean>;
