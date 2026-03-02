import type { CoinGeckoResponse, YahooChartResponse, MergedDataPoint } from './types';

export function mergeTimeSeries(sources: {
  btcData: PromiseSettledResult<CoinGeckoResponse>;
  ethData: PromiseSettledResult<CoinGeckoResponse>;
  fbtcData: PromiseSettledResult<YahooChartResponse>;
  fethData: PromiseSettledResult<YahooChartResponse>;
}): MergedDataPoint[] {
  const dateMap = new Map<string, MergedDataPoint>();

  // Process CoinGecko data (timestamps in ms)
  if (sources.btcData.status === 'fulfilled') {
    for (const [tsMs, price] of sources.btcData.value.prices) {
      const date = new Date(tsMs).toISOString().slice(0, 10);
      const existing = dateMap.get(date) || { date };
      existing.btc = price;
      dateMap.set(date, existing);
    }
  }

  if (sources.ethData.status === 'fulfilled') {
    for (const [tsMs, price] of sources.ethData.value.prices) {
      const date = new Date(tsMs).toISOString().slice(0, 10);
      const existing = dateMap.get(date) || { date };
      existing.eth = price;
      dateMap.set(date, existing);
    }
  }

  // Process Yahoo Finance data (timestamps in seconds)
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
