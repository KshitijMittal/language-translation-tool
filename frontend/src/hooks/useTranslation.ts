import { useMutation } from "@tanstack/react-query";
import { translateText } from "../services/api";
import type { TranslateRequest } from "../types";

export function useTranslation() {
  return useMutation({
    mutationFn: (req: TranslateRequest) => translateText(req),
    retry: 1,
  });
}
