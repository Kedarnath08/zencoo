package com.zencoo.repository;

import com.zencoo.model.PostComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface PostCommentRepository extends JpaRepository<PostComment, Long> {
    long countByPostId(Long postId);
    List<PostComment> findByPostIdOrderByCreatedAtAsc(Long postId);

    @Transactional
    void deleteByPostId(Long postId);
}
