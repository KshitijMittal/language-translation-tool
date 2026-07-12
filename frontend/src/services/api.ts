import type { TranslateRequest, TranslateResponse } from "../types";

const BASE = "/api";

export async function fetchLanguages(): Promise<Record<string, string>> {
  const resp = await fetch(`${BASE}/languages`);
  if (!resp.ok) {
    throw new Error("Failed to load languages");
  }
  const data = await resp.json();
  return data.languages;
}

export async function translateText(
  req: TranslateRequest
): Promise<TranslateResponse> {
  const resp = await fetch(`${BASE}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  const data = await resp.json();

  if (!resp.ok) {
    throw new Error(data.error || "Translation failed");
  }

  return data;
}
