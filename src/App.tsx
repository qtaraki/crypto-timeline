import { useState } from 'react';
import type { ViewMode, VisibleSeries } from './lib/types';
import { useMarketData } from './hooks/useMarketData';
import { Header } from './components/Header';
import { RangeSelector } from './components/RangeSelector';
import { ViewToggle } from './components/ViewToggle';
import { PriceChart } from './components/PriceChart';
import { AssetLegend } from './components/AssetLegend';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorBanner } from './components/ErrorBanner';

function App() {
  const [days, setDays] = useState(30);
  const [viewMode, setViewMode] = useState<ViewMode>('percent');
  const [visibleSeries, setVisibleSeries] = useState<VisibleSeries>({
    btc: true,
    eth: true,
    fbtc: true,
    feth: true,
  });

  const { data, isLoading, error, etfWarning, refetch } = useMarketData(days);

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-6 text-white">
      <div className="mx-auto max-w-3xl">
        <Header />
        <RangeSelector days={days} onChange={setDays} />
        <ViewToggle mode={viewMode} onChange={setViewMode} />

        {isLoading && <LoadingSpinner />}
        {error && <ErrorBanner message={error} onRetry={refetch} />}

        {etfWarning && !error && (
          <div className="mt-3 rounded-md bg-yellow-900/30 px-3 py-2 text-center text-xs text-yellow-300">
            ETF data temporarily unavailable. Showing crypto prices only.
          </div>
        )}

        {data && !isLoading && (
          <PriceChart data={data} viewMode={viewMode} visibleSeries={visibleSeries} />
        )}

        <AssetLegend visibleSeries={visibleSeries} onToggle={setVisibleSeries} />

        <footer className="mt-8 text-center text-xs text-gray-600">
          Data from CoinGecko &amp; Yahoo Finance. Not financial advice.
        </footer>
      </div>
    </div>
  );
}

export default App;
