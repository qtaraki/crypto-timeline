export function LoadingSpinner() {
  return (
    <div className="mt-4 flex h-[350px] w-full items-center justify-center rounded-xl bg-gray-800/50 sm:h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500" />
        <span className="text-sm text-gray-500">Loading market data...</span>
      </div>
    </div>
  );
}
