import { useCallback, useEffect, useRef, useState } from "react";

interface LanguageSelectProps {
  id: string;
  label: string;
  value: string;
  languages: Record<string, string>;
  includeAuto?: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
}

export function LanguageSelect({
  id,
  label,
  value,
  languages,
  includeAuto,
  placeholder,
  onChange,
}: LanguageSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedName = value === "auto" ? "Auto Detect" : languages[value] || placeholder || "";

  const entries = includeAuto
    ? [["auto", "Auto Detect"] as const, ...Object.entries(languages)]
    : Object.entries(languages);

  const filtered = search
    ? entries.filter(
        ([, name]) => name.toLowerCase().includes(search.toLowerCase())
      )
    : entries;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = useCallback(
    (code: string) => {
      onChange(code);
      setOpen(false);
      setSearch("");
    },
    [onChange]
  );

  return (
    <div ref={dropdownRef} className="relative">
      <label
        htmlFor={id}
        className="block text-[11px] font-medium tracking-wider uppercase text-text-secondary-light dark:text-text-secondary-dark mb-1.5"
      >
        {label}
      </label>

      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-150 cursor-pointer
          ${
            open
              ? "ring-2 ring-accent/30 border-accent"
              : "border-border-light dark:border-border-dark hover:border-gray-300 dark:hover:border-gray-600"
          }
          border bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark`}
      >
        <span className={`truncate ${!value ? "text-text-secondary-light dark:text-text-secondary-dark" : ""}`}>
          {selectedName || "Select..."}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-text-secondary-light dark:text-text-secondary-dark transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[200px] bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-lg animate-scaleIn origin-top overflow-hidden">
          <div className="p-2 pb-1">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800 text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            />
          </div>
          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.map(([code, name]) => (
              <button
                key={code}
                type="button"
                onClick={() => handleSelect(code)}
                className={`w-full text-left px-3 py-1.5 text-sm transition-colors cursor-pointer flex items-center gap-2 ${
                  value === code
                    ? "bg-accent-subtle-light dark:bg-accent-subtle-dark text-accent dark:text-accent-text font-medium"
                    : "text-text-primary-light dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-white/5"
                }`}
              >
                {includeAuto && code === "auto" && (
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                )}
                <span className="truncate">{name}</span>
                {value === code && (
                  <svg className="w-3.5 h-3.5 ml-auto shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-3 text-xs text-text-secondary-light dark:text-text-secondary-dark text-center">
                No languages found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
