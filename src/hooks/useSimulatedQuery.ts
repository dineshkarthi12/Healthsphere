import { useCallback, useEffect, useState } from "react";

/**
 * Simulates an async fetch over mock data so every screen exercises real
 * loading / error / empty states. Append ?simulate=error to any URL to see
 * the error state.
 */
export function useSimulatedQuery<T>(getData: () => T, deps: unknown[] = [], delay = 450) {
  const [state, setState] = useState<{ status: "loading" | "success" | "error"; data?: T }>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setState((s) => ({ status: "loading", data: s.data }));
    const forceError = new URLSearchParams(window.location.search).get("simulate") === "error" && attempt === 0;
    const t = window.setTimeout(() => {
      if (forceError) setState({ status: "error" });
      else setState({ status: "success", data: getData() });
    }, delay);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  return { ...state, retry, isLoading: state.status === "loading" };
}
