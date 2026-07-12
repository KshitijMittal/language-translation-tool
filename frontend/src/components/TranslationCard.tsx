import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguages } from "../hooks/useLanguages";
import { useTranslation } from "../hooks/useTranslation";
import type { HistoryEntry } from "../types";
import { LanguageSelect } from "./LanguageSelect";
import { InputArea } from "./InputArea";
import { OutputArea } from "./OutputArea";
import { CopyButton } from "./CopyButton";
import { SpeakButton } from "./SpeakButton";

interface TranslationCardProps {
  onAddEntry: (
    sourceText: string,
    translatedText: string,
    sourceLang: string,
    targetLang: string
  ) => void;
}

export function TranslationCard({ onAddEntry }: TranslationCardProps) {
  const { data: languages = {}, isLoading: langsLoading, error: langsError } = useLanguages();
  const translateMutation = useTranslation();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [sourceText, setSourceText] = useState("");
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [translateKey, setTranslateKey] = useState(0);
  const [speaking, setSpeaking] = useState(false);

  const canSwap = sourceLang !== "auto" && translatedText;

  const handleSwap = useCallback(() => {
    if (!canSwap) return;
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText("");
    setDetectedLanguage(null);
  }, [canSwap, sourceLang, targetLang, translatedText]);

  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim() || !targetLang) {
      setTranslateKey((k) => k + 1);
      return;
    }

    try {
      const result = await translateMutation.mutateAsync({
        text: sourceText,
        target: targetLang,
        source: sourceLang === "auto" ? undefined : sourceLang,
      });

      setTranslatedText(result.translatedText);
      setDetectedLanguage(result.detectedLanguage ?? null);

      if (result.detectedLanguage && sourceLang === "auto") {
        setSourceLang(result.detectedLanguage);
      }

      onAddEntry(
        sourceText,
        result.translatedText,
        result.detectedLanguage || sourceLang,
        targetLang
      );
    } catch {
      // Error is displayed via translateMutation.isError in the UI
    }
  }, [sourceText, targetLang, sourceLang, translateMutation, onAddEntry]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleTranslate();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleTranslate]);

  useEffect(() => {
    function handleHistorySelect(e: Event) {
      const entry = (e as CustomEvent<HistoryEntry>).detail;
      setSourceText(entry.sourceText);
      setSourceLang(entry.sourceLang);
      setTargetLang(entry.targetLang);
      setTranslatedText(entry.translatedText);
      setDetectedLanguage(null);
      inputRef.current?.focus();
    }
    window.addEventListener("history-select", handleHistorySelect);
    return () => window.removeEventListener("history-select", handleHistorySelect);
  }, []);

  const shakeTrigger = translateKey;
  const hasError = !!langsError;
  const errorMessage = langsError instanceof Error ? langsError.message : "Failed to load languages";
  const isTranslating = translateMutation.isPending;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-[0_1px_3px_0_rgb(0,0,0,0.04),0_1px_2px_-1px_rgb(0,0,0,0.06)] dark:shadow-[0_1px_3px_0_rgb(0,0,0,0.3),0_1px_2px_-1px_rgb(0,0,0,0.2)] border border-border-light dark:border-border-dark transition-all duration-300 overflow-hidden">
        {/* Language selector bar */}
        <div className="flex items-end gap-2 p-5 pb-0">
          <div className="flex-1">
            <LanguageSelect
              id="source-lang"
              label="From"
              value={sourceLang}
              languages={languages}
              includeAuto
              onChange={setSourceLang}
            />
          </div>

          <button
            onClick={handleSwap}
            disabled={!canSwap}
            title="Swap languages"
            className={`shrink-0 mb-0.5 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
              canSwap
                ? "text-accent hover:bg-accent-subtle-light dark:hover:bg-accent-subtle-dark cursor-pointer active:scale-90"
                : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 16l-4-4 4-4" />
              <path d="M17 8l4 4-4 4" />
              <path d="M3 12h18" />
            </svg>
          </button>

          <div className="flex-1">
            <LanguageSelect
              id="target-lang"
              label="To"
              value={targetLang}
              languages={languages}
              placeholder="Select language"
              onChange={setTargetLang}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 mt-4 h-px bg-border-light dark:bg-border-dark" />

        {/* Input area */}
        <div className="p-5 pb-0">
          {langsLoading ? (
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
              <div className="h-28 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            </div>
          ) : hasError ? (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-danger-subtle-light dark:bg-danger-subtle-dark text-sm text-danger">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          ) : (
            <InputArea
              ref={inputRef}
              value={sourceText}
              onChange={setSourceText}
              onTranslate={handleTranslate}
            />
          )}
        </div>

        {/* Translate button */}
        {!langsLoading && !hasError && (
          <div className="px-5 pt-4 pb-5">
            <button
              onClick={handleTranslate}
              disabled={!sourceText.trim() || !targetLang || isTranslating}
              className={`w-full h-11 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                !sourceText.trim() || !targetLang
                  ? "bg-gray-100 dark:bg-gray-800 text-text-secondary-light dark:text-text-secondary-dark cursor-not-allowed"
                  : isTranslating
                    ? "bg-accent/90 text-white cursor-wait"
                    : "bg-accent text-white hover:bg-accent-hover active:scale-[0.98] cursor-pointer shadow-sm"
              } ${shakeTrigger > 0 ? "animate-shake" : ""}`}
            >
              {isTranslating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Translating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  Translate
                  <span className="hidden sm:inline text-white/60 text-xs">Ctrl+Enter</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Translation result */}
        {(translatedText || translateMutation.isError) && !langsLoading && !hasError && (
          <div className="border-t border-border-light dark:border-border-dark animate-fadeIn">
            <div className="p-5">
              {translateMutation.isError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-danger-subtle-light dark:bg-danger-subtle-dark text-sm text-danger mb-4">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  <span>
                    {translateMutation.error instanceof Error
                      ? translateMutation.error.message
                      : "Translation failed"}
                  </span>
                </div>
              )}

              <OutputArea
                translatedText={translatedText}
                detectedLanguage={detectedLanguage}
                languageNames={languages}
                speaking={speaking}
              />
            </div>

            {/* Action buttons */}
            {translatedText && (
              <div className="px-5 pb-5 flex items-center gap-2">
                <CopyButton text={translatedText} />
                <SpeakButton
                  text={translatedText}
                  language={targetLang}
                  onSpeakingChange={setSpeaking}
                />
              </div>
            )}
          </div>
        )}

        {/* No target language hint */}
        {!targetLang && sourceText.trim() && (
          <div className="px-5 pb-5">
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              Select a target language to translate
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
