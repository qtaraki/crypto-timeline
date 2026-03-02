import { RANGES } from '../lib/constants';

interface RangeSelectorProps {
  days: number;
  onChange: (days: number) => void;
}

export function RangeSelector({ days, onChange }: RangeSelectorProps) {
  return (
    <div className="mt-4 flex justify-center gap-2">
      {RANGES.map((r) => (
        <button
          key={r.days}
          onClick={() => onChange(r.days)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            days === r.days
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
