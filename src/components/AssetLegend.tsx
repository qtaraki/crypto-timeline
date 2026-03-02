import type { SeriesKey, VisibleSeries } from '../lib/types';
import { SERIES_CONFIG } from '../lib/constants';

interface AssetLegendProps {
  visibleSeries: VisibleSeries;
  onToggle: (series: VisibleSeries) => void;
}

const KEYS: SeriesKey[] = ['btc', 'eth', 'fbtc', 'feth'];

export function AssetLegend({ visibleSeries, onToggle }: AssetLegendProps) {
  const toggle = (key: SeriesKey) => {
    onToggle({ ...visibleSeries, [key]: !visibleSeries[key] });
  };

  return (
    <div className="mt-4 flex flex-wrap justify-center gap-3">
      {KEYS.map((key) => {
        const cfg = SERIES_CONFIG[key];
        const active = visibleSeries[key];
        return (
          <button
            key={key}
            onClick={() => toggle(key)}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-opacity ${
              active ? 'opacity-100' : 'opacity-40'
            }`}
          >
            <span
              className="inline-block h-0.5 w-5"
              style={{
                backgroundColor: cfg.color,
                borderBottom: cfg.dashed ? `2px dashed ${cfg.color}` : `2px solid ${cfg.color}`,
              }}
            />
            <span className="text-gray-300">{cfg.label}</span>
          </button>
        );
      })}
    </div>
  );
}
