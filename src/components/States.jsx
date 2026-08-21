import { AlertTriangle, Loader2, Inbox } from 'lucide-react';

export function LoadingState({ label = 'Loading market data…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted gap-3">
      <Loader2 className="animate-spin" size={28} />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function ErrorState({ message = 'Market data temporarily unavailable. Please try again.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <AlertTriangle className="text-loss" size={28} />
      <p className="text-sm text-muted max-w-sm">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-ghost text-sm mt-1">
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title = 'Nothing here yet', subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <Inbox className="text-faint" size={28} />
      <p className="text-sm font-medium text-paper">{title}</p>
      {subtitle && <p className="text-xs text-muted max-w-sm">{subtitle}</p>}
      {action}
    </div>
  );
}
