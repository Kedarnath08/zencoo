import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { addComment, type PostComment } from "../api/posts";
import { patchPostInCache } from "../api/postsCache";
import { queryKeys } from "../api/queryKeys";

export function useAddComment(postId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => addComment(postId, text),
    onSuccess: (created) => {
      qc.setQueryData<InfiniteData<PostComment[]>>(queryKeys.comments(postId), (old) => {
        if (!old) return old;
        const pages = [...old.pages];
        pages[pages.length - 1] = [...pages[pages.length - 1], created];
        return { ...old, pages };
      });
      patchPostInCache(qc, postId, (p) => ({ ...p, commentCount: p.commentCount + 1 }));
    },
  });
}
