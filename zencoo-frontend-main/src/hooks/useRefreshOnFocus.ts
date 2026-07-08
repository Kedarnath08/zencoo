import { useCallback, useEffect, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";

/**
 * Re-runs `callback` every time the screen regains focus — the
 * `useFocusEffect(useCallback(() => { load(); }, [load]))` shape repeated
 * across several screens.
 *
 * `callback` is read via a ref rather than passed directly as a dependency:
 * React Navigation's `useFocusEffect` re-invokes its effect (and therefore
 * the callback) whenever the callback's identity changes while the screen
 * is still focused — fine for callbacks that are already stable (e.g. a
 * `useCallback`'d `reset` with stable deps), but a footgun for things like
 * TanStack Query's `refetch`, which isn't guaranteed stable across renders.
 */
export function useRefreshOnFocus(callback: () => void): void {
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  });

  useFocusEffect(
    useCallback(() => {
      callbackRef.current();
    }, [])
  );
}
