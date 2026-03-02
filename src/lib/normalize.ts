import type { MergedDataPoint } from './types';

export function normalizeToPercent(data: MergedDataPoint[]): MergedDataPoint[] {
  if (data.length === 0) return data;
  const first = data[0];
  return data.map((point) => ({
    date: point.date,
    btc:
      first.btc != null && point.btc != null
        ? ((point.btc - first.btc) / first.btc) * 100
        : undefined,
    eth:
      first.eth != null && point.eth != null
        ? ((point.eth - first.eth) / first.eth) * 100
        : undefined,
    fbtc:
      first.fbtc != null && point.fbtc != null
        ? ((point.fbtc - first.fbtc) / first.fbtc) * 100
        : undefined,
    feth:
      first.feth != null && point.feth != null
        ? ((point.feth - first.feth) / first.feth) * 100
        : undefined,
  }));
}
