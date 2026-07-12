import type { HistoryEntry } from "../types";

interface HistoryPanelProps {
  entries: HistoryEntry[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (entry: HistoryEntry) => void;
  onClear: () => void;
}

function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + "\u2026" : text;
}

export function HistoryPanel({
  entries,
  isOpen,
  onClose,
  onSelect,
  onClear,
}: HistoryPanelProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 animate-drawerFadeIn"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-surface-light dark:bg-surface-dark shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-border-light dark:border-border-dark shrink-0">
          <h2 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
            <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            History
            {entries.length > 0 && (
              <span className="text-[11px] font-normal text-text-secondary-light dark:text-text-secondary-dark">
                ({entries.length})
              </span>
            )}
          </h2>
          <div className="flex items-center gap-1">
            {entries.length > 0 && (
              <button
                onClick={onClear}
                className="px-2.5 py-1 text-xs text-text-secondary-light dark:text-text-secondary-dark hover:text-danger transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Entries */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1.5">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-text-secondary-light dark:text-text-secondary-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                No translations yet
              </p>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                Your translation history will appear here
              </p>
            </div>
          ) : (
            entries.map((entry, i) => (
              <button
                key={entry.id}
                onClick={() => onSelect(entry)}
                className="w-full text-left group relative p-3 rounded-xl border border-border-light dark:border-border-dark hover:border-accent/30 hover:bg-accent-subtle-light dark:hover:bg-accent-subtle-dark/50 transition-all duration-200 cursor-pointer active:scale-[0.99]"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="flex items-center gap-1.5 text-[11px] text-text-secondary-light dark:text-text-secondary-dark mb-1.5">
                  <span className="font-medium uppercase tracking-wider">{entry.sourceLang}</span>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                  <span className="font-medium uppercase tracking-wider">{entry.targetLang}</span>
                  <span className="ml-auto tabular-nums opacity-60">{formatTime(entry.timestamp)}</span>
                </div>
                <p className="text-sm text-text-primary-light dark:text-text-primary-dark leading-snug">
                  {truncate(entry.sourceText, 50)}
                </p>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-snug mt-0.5 line-clamp-2">
                  {truncate(entry.translatedText, 60)}
                </p>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}
