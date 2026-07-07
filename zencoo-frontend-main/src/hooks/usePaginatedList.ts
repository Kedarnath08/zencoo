import { useCallback, useRef, useState } from "react";

interface UsePaginatedListResult<T> {
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  /** True only for the very first load (nothing on screen yet). */
  loading: boolean;
  /** True while `reset()` re-fetches page 0 after the first successful load (e.g. pull-to-refresh) — list stays visible. */
  refreshing: boolean;
  /** True while a subsequent page is being fetched. */
  loadingMore: boolean;
  /** False once a page comes back shorter than pageSize. */
  hasMore: boolean;
  /** Refetches from page 0 and replaces the list — use for pull-to-refresh/focus. */
  reset: () => Promise<void>;
  /** Fetches the next page and appends — wire to FlatList's onEndReached. */
  loadMore: () => Promise<void>;
}

/**
 * Shared infinite-scroll pagination: accumulates pages fetched via
 * `fetchPage(page, size)`, tracking end-of-list by a short page (fewer
 * items than requested) rather than a total count, since the backend
 * returns a flat list per page (no Page envelope).
 */
export function usePaginatedList<T>(
  fetchPage: (page: number, size: number) => Promise<T[]>,
  pageSize = 20
): UsePaginatedListResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const nextPage = useRef(0);
  const busy = useRef(false);
  const hasLoadedOnce = useRef(false);

  const reset = useCallback(async () => {
    busy.current = true;
    if (hasLoadedOnce.current) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await fetchPage(0, pageSize);
      setItems(data);
      nextPage.current = 1;
      setHasMore(data.length === pageSize);
    } catch {
      setItems([]);
      nextPage.current = 1;
      setHasMore(false);
    } finally {
      hasLoadedOnce.current = true;
      setLoading(false);
      setRefreshing(false);
      busy.current = false;
    }
  }, [fetchPage, pageSize]);

  const loadMore = useCallback(async () => {
    if (busy.current || !hasMore) return;
    busy.current = true;
    setLoadingMore(true);
    try {
      const data = await fetchPage(nextPage.current, pageSize);
      setItems((prev) => [...prev, ...data]);
      nextPage.current += 1;
      setHasMore(data.length === pageSize);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
      busy.current = false;
    }
  }, [fetchPage, pageSize, hasMore]);

  return { items, setItems, loading, refreshing, loadingMore, hasMore, reset, loadMore };
}
