interface ErrorBannerProps {
  message: string;
  onRetry: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="mt-4 rounded-lg bg-red-900/30 p-4 text-center">
      <p className="text-sm text-red-300">{message}</p>
      <button
        onClick={onRetry}
        className="mt-2 rounded-md bg-red-700 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
      >
        Retry
      </button>
    </div>
  );
}
