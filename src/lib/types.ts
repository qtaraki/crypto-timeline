export interface MergedDataPoint {
  date: string;
  btc?: number;
  eth?: number;
  fbtc?: number;
  feth?: number;
}

/** Normalized price series: array of [date_string, price_usd] */
export type PriceSeries = [string, number][];

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
