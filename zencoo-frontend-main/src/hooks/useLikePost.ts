import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleLike, type FeedPost } from "../api/posts";
import { patchPostInCache } from "../api/postsCache";
import { queryKeys } from "../api/queryKeys";

const toggle = (p: FeedPost): FeedPost => ({
  ...p,
  likedByMe: !p.likedByMe,
  likeCount: p.likeCount + (p.likedByMe ? -1 : 1),
});

export function useLikePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => toggleLike(postId),
    onMutate: async (postId: number) => {
      const prevPost = qc.getQueryData<FeedPost>(queryKeys.post(postId));
      const prevFeed = qc.getQueryData(queryKeys.feed());
      patchPostInCache(qc, postId, toggle);
      return { prevPost, prevFeed, postId };
    },
    onError: (_err, _postId, ctx) => {
      if (!ctx) return;
      if (ctx.prevPost) qc.setQueryData(queryKeys.post(ctx.postId), ctx.prevPost);
      if (ctx.prevFeed) qc.setQueryData(queryKeys.feed(), ctx.prevFeed);
    },
    onSuccess: (updated) => patchPostInCache(qc, updated.id, () => updated),
  });
}
