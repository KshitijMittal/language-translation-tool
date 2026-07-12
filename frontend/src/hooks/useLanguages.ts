import { useQuery } from "@tanstack/react-query";
import { fetchLanguages } from "../services/api";

export function useLanguages() {
  return useQuery({
    queryKey: ["languages"],
    queryFn: fetchLanguages,
    staleTime: Infinity,
    retry: 2,
  });
}
