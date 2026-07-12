import { forwardRef, useMemo } from "react";

interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onTranslate: () => void;
}

const MAX_CHARS = 5000;

export const InputArea = forwardRef<HTMLTextAreaElement, InputAreaProps>(
  function InputArea({ value, onChange, onTranslate }, ref) {
    const charCount = value.length;
    const wordCount = useMemo(
      () => (value.trim() ? value.trim().split(/\s+/).length : 0),
      [value]
    );

    const counterColor =
      charCount >= MAX_CHARS
        ? "text-danger"
        : charCount >= 4000
          ? "text-orange-500"
          : "text-text-secondary-light dark:text-text-secondary-dark";

    return (
      <div>
        <div className="relative">
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter text to translate..."
            maxLength={MAX_CHARS}
            rows={4}
            className="w-full resize-y min-h-[120px] max-h-[320px] px-0 py-0 text-base leading-relaxed bg-transparent border-0 text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light/50 dark:placeholder:text-text-secondary-dark/40 focus:outline-none focus:ring-0 transition-colors"
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                onTranslate();
              }
            }}
          />
          {/* Gradient fade at bottom for long text */}
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-surface-light dark:from-surface-dark to-transparent pointer-events-none" />
        </div>

        <div className="flex items-center justify-between mt-1.5">
          <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            {wordCount > 0 && (
              <span>
                {wordCount} {wordCount === 1 ? "word" : "words"}
              </span>
            )}
          </div>
          <div className={`text-xs tabular-nums ${counterColor}`}>
            {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </div>
        </div>
      </div>
    );
  }
);
