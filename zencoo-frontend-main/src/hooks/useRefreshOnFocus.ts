import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

/**
 * Re-runs `callback` every time the screen regains focus — the
 * `useFocusEffect(useCallback(() => { load(); }, [load]))` shape repeated
 * across several screens.
 */
export function useRefreshOnFocus(callback: () => void): void {
  useFocusEffect(
    useCallback(() => {
      callback();
    }, [callback])
  );
}
