export interface TranslateRequest {
  text: string;
  target: string;
  source?: string;
}

export interface TranslateResponse {
  translatedText: string;
  detectedLanguage?: string;
}

export interface HistoryEntry {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: number;
}
