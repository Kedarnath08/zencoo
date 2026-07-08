import { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { FeedPost } from "./posts";
import { queryKeys } from "./queryKeys";

export function patchPostInCache(
  qc: QueryClient,
  postId: number,
  updater: (post: FeedPost) => FeedPost
) {
  qc.setQueryData<FeedPost>(queryKeys.post(postId), (old) => old && updater(old));

  qc.setQueriesData<InfiniteData<FeedPost[]>>({ queryKey: queryKeys.feed() }, (old) =>
    old && {
      ...old,
      pages: old.pages.map((page) => page.map((p) => (p.id === postId ? updater(p) : p))),
    }
  );

  qc.setQueriesData<FeedPost[]>({ queryKey: ["myPosts"] }, (old) =>
    old?.map((p) => (p.id === postId ? updater(p) : p))
  );
}

export function removePostFromCache(qc: QueryClient, postId: number) {
  qc.removeQueries({ queryKey: queryKeys.post(postId) });

  qc.setQueriesData<InfiniteData<FeedPost[]>>({ queryKey: queryKeys.feed() }, (old) =>
    old && { ...old, pages: old.pages.map((page) => page.filter((p) => p.id !== postId)) }
  );

  qc.setQueriesData<FeedPost[]>({ queryKey: ["myPosts"] }, (old) =>
    old?.filter((p) => p.id !== postId)
  );
}
