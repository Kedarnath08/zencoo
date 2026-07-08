import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchComments, type PostComment } from "../api/posts";
import { queryKeys } from "../api/queryKeys";

const PAGE_SIZE = 20;

/**
 * Infinite-scroll comment list for a post. `enabled` lets callers that only
 * need the first page on demand (e.g. Feed's comment modal) defer fetching
 * until the modal actually opens, while still sharing one cache entry with
 * any other screen viewing the same post's comments (e.g. PostDetail).
 */
export function useComments(postId: number, enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.comments(postId),
    queryFn: ({ pageParam }) => fetchComments(postId, pageParam, PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
    enabled,
  });
}

export function flattenComments(
  data: { pages: PostComment[][] } | undefined
): PostComment[] {
  return data?.pages.flat() ?? [];
}
