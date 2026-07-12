import { useCallback, useState } from "react";
import type { HistoryEntry } from "../types";

const STORAGE_KEY = "translation_history";
const MAX_ENTRIES = 20;

function loadHistory(): HistoryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(loadHistory);

  const addEntry = useCallback(
    (sourceText: string, translatedText: string, sourceLang: string, targetLang: string) => {
      const newEntry: HistoryEntry = {
        id: crypto.randomUUID(),
        sourceText,
        translatedText,
        sourceLang,
        targetLang,
        timestamp: Date.now(),
      };

      setEntries((prev) => {
        const existingIndex = prev.findIndex(
          (e) =>
            e.sourceText === sourceText &&
            e.sourceLang === sourceLang &&
            e.targetLang === targetLang
        );
        const updated = [newEntry, ...prev.filter((_, i) => i !== existingIndex)].slice(
          0,
          MAX_ENTRIES
        );
        saveHistory(updated);
        return updated;
      });
    },
    []
  );

  const clearHistory = useCallback(() => {
    setEntries([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { entries, addEntry, clearHistory };
}
