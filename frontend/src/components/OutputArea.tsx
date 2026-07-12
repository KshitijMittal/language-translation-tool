interface OutputAreaProps {
  translatedText: string;
  detectedLanguage: string | null;
  languageNames: Record<string, string>;
  speaking?: boolean;
}

const WAVE_KEYFRAMES = `
@keyframes out-wave {
  0%, 100% { height: 4px; }
  50% { height: 16px; }
}
.out-wave-bar {
  animation: out-wave 0.7s ease-in-out infinite;
  background-color: #6366f1;
  width: 4px;
  border-radius: 9999px;
  display: inline-block;
}
`;

export function OutputArea({
  translatedText,
  detectedLanguage,
  languageNames,
  speaking,
}: OutputAreaProps) {
  if (!translatedText) {
    return null;
  }

  return (
    <div className="animate-fadeIn">
      {speaking && <style>{WAVE_KEYFRAMES}</style>}

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {detectedLanguage && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-accent-subtle-light dark:bg-accent-subtle-dark text-accent dark:text-accent-text">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              {languageNames[detectedLanguage] || detectedLanguage}
            </span>
          )}
        </div>

        {/* Sound wave animation */}
        {speaking && (
          <div className="flex items-end gap-[3px] h-5" aria-hidden="true">
            <span className="out-wave-bar" style={{ animationDelay: "0s" }} />
            <span className="out-wave-bar" style={{ animationDelay: "0.12s" }} />
            <span className="out-wave-bar" style={{ animationDelay: "0.24s" }} />
            <span className="out-wave-bar" style={{ animationDelay: "0.36s" }} />
            <span className="out-wave-bar" style={{ animationDelay: "0.24s" }} />
            <span className="out-wave-bar" style={{ animationDelay: "0.12s" }} />
          </div>
        )}
      </div>

      <div className="relative">
        <div className="min-h-[120px] max-h-[320px] overflow-y-auto px-0 py-0 text-base leading-relaxed text-text-primary-light dark:text-text-primary-dark whitespace-pre-wrap break-words">
          {translatedText}
        </div>
      </div>
    </div>
  );
}
