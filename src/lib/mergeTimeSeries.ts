import type { PriceSeries, YahooChartResponse, MergedDataPoint } from './types';

export function mergeTimeSeries(sources: {
  btcData: PromiseSettledResult<PriceSeries>;
  ethData: PromiseSettledResult<PriceSeries>;
  fbtcData: PromiseSettledResult<YahooChartResponse>;
  fethData: PromiseSettledResult<YahooChartResponse>;
}): MergedDataPoint[] {
  const dateMap = new Map<string, MergedDataPoint>();

  // Process crypto data (already normalized to [date, price] pairs)
  if (sources.btcData.status === 'fulfilled') {
    for (const [date, price] of sources.btcData.value) {
      const existing = dateMap.get(date) || { date };
      existing.btc = price;
      dateMap.set(date, existing);
    }
  }

  if (sources.ethData.status === 'fulfilled') {
    for (const [date, price] of sources.ethData.value) {
      const existing = dateMap.get(date) || { date };
      existing.eth = price;
      dateMap.set(date, existing);
    }
  }

  // Process Yahoo Finance ETF data (timestamps in seconds)
  if (sources.fbtcData.status === 'fulfilled') {
    const result = sources.fbtcData.value.chart.result?.[0];
    if (result) {
      result.timestamp.forEach((tsSec, i) => {
        const date = new Date(tsSec * 1000).toISOString().slice(0, 10);
        const close = result.indicators.quote[0].close[i];
        if (close != null) {
          const existing = dateMap.get(date) || { date };
          existing.fbtc = close;
          dateMap.set(date, existing);
        }
      });
    }
  }

  if (sources.fethData.status === 'fulfilled') {
    const result = sources.fethData.value.chart.result?.[0];
    if (result) {
      result.timestamp.forEach((tsSec, i) => {
        const date = new Date(tsSec * 1000).toISOString().slice(0, 10);
        const close = result.indicators.quote[0].close[i];
        if (close != null) {
          const existing = dateMap.get(date) || { date };
          existing.feth = close;
          dateMap.set(date, existing);
        }
      });
    }
  }

  return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}
