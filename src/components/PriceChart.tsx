import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { MergedDataPoint, ViewMode, VisibleSeries } from '../lib/types';
import { SERIES_CONFIG } from '../lib/constants';
import { normalizeToPercent } from '../lib/normalize';

interface PriceChartProps {
  data: MergedDataPoint[];
  viewMode: ViewMode;
  visibleSeries: VisibleSeries;
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`;
  }
  return `$${value.toFixed(2)}`;
}

function tooltipFormatter(value: number, name: string, viewMode: ViewMode): [string, string] {
  const label = SERIES_CONFIG[name as keyof typeof SERIES_CONFIG]?.label ?? name;
  if (viewMode === 'percent') {
    return [`${value >= 0 ? '+' : ''}${value.toFixed(2)}%`, label];
  }
  return [
    value >= 1 ? `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}` : `$${value.toFixed(4)}`,
    label,
  ];
}

export function PriceChart({ data, viewMode, visibleSeries }: PriceChartProps) {
  const chartData = viewMode === 'percent' ? normalizeToPercent(data) : data;

  return (
    <div className="mt-4">
      <ResponsiveContainer width="100%" height={350} className="sm:!h-[420px]">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            tickFormatter={formatDateShort}
            stroke="#4B5563"
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            stroke="#4B5563"
            tickFormatter={(v: number) =>
              viewMode === 'percent' ? `${v >= 0 ? '+' : ''}${v.toFixed(0)}%` : formatCurrency(v)
            }
            width={65}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
            }}
            labelStyle={{ color: '#9CA3AF', marginBottom: 4 }}
            labelFormatter={(d) => {
              const date = new Date(String(d) + 'T00:00:00');
              return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
            }}
            formatter={(value, name) => tooltipFormatter(Number(value), String(name), viewMode)}
          />
          {visibleSeries.btc && (
            <Line
              type="monotone"
              dataKey="btc"
              stroke={SERIES_CONFIG.btc.color}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          )}
          {visibleSeries.eth && (
            <Line
              type="monotone"
              dataKey="eth"
              stroke={SERIES_CONFIG.eth.color}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          )}
          {visibleSeries.fbtc && (
            <Line
              type="monotone"
              dataKey="fbtc"
              stroke={SERIES_CONFIG.fbtc.color}
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              connectNulls
            />
          )}
          {visibleSeries.feth && (
            <Line
              type="monotone"
              dataKey="feth"
              stroke={SERIES_CONFIG.feth.color}
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              connectNulls
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
