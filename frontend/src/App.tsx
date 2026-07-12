import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeToggle } from "./components/ThemeToggle";
import { TranslationCard } from "./components/TranslationCard";
import { HistoryPanel } from "./components/HistoryPanel";
import { useTheme } from "./hooks/useTheme";
import { useHistory } from "./hooks/useHistory";
import type { HistoryEntry } from "./types";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const { entries, addEntry, clearHistory } = useHistory();
  const [historyOpen, setHistoryOpen] = useState(false);

  const handleHistorySelect = (entry: HistoryEntry) => {
    setHistoryOpen(false);
    window.dispatchEvent(
      new CustomEvent("history-select", { detail: entry })
    );
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark transition-colors duration-500">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 dark:bg-[#0c0a09]/70 border-b border-border-light dark:border-border-dark transition-colors">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight">
              Translate
            </h1>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setHistoryOpen(true)}
              className="relative p-2 rounded-xl text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-95 cursor-pointer"
              aria-label="Open history"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </button>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>
      </header>

      <main className="px-4 py-8 sm:py-12 lg:py-16">
        <TranslationCard onAddEntry={addEntry} />
      </main>

      <HistoryPanel
        entries={entries}
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelect={handleHistorySelect}
        onClear={clearHistory}
      />
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
