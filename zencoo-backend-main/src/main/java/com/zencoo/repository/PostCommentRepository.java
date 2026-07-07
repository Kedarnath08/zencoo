package com.zencoo.repository;

import com.zencoo.model.PostComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface PostCommentRepository extends JpaRepository<PostComment, Long> {
    long countByPostId(Long postId);
    List<PostComment> findByPostIdOrderByCreatedAtAsc(Long postId);

    /** Comment counts for a batch of posts, grouped by post id (avoids one query per post). */
    @Query("SELECT pc.post.id, COUNT(pc) FROM PostComment pc WHERE pc.post.id IN :postIds GROUP BY pc.post.id")
    List<Object[]> countByPostIdIn(@Param("postIds") List<Long> postIds);

    @Transactional
    void deleteByPostId(Long postId);
}
