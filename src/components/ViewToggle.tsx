import type { ViewMode } from '../lib/types';

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ mode, onChange }: ViewToggleProps) {
  return (
    <div className="mt-3 flex justify-center gap-1 rounded-lg bg-gray-800 p-1 sm:mx-auto sm:w-fit">
      <button
        onClick={() => onChange('price')}
        className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
          mode === 'price'
            ? 'bg-gray-600 text-white'
            : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        Price (USD)
      </button>
      <button
        onClick={() => onChange('percent')}
        className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
          mode === 'percent'
            ? 'bg-gray-600 text-white'
            : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        % Change
      </button>
    </div>
  );
}
