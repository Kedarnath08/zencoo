package com.zencoo.repository;

import com.zencoo.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findByGoogleId(String googleId);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);

    /**
     * Residents directory, filtered at the DB level instead of loading every
     * user and filtering in memory. Wing is the first character of the door
     * number; pass null/blank to skip the wing filter.
     */
    @Query(value = "SELECT u FROM User u WHERE u.id <> :currentUserId " +
            "AND (:wing IS NULL OR :wing = '' OR SUBSTRING(u.doorNumber, 1, 1) = :wing) " +
            "ORDER BY u.id",
            countQuery = "SELECT COUNT(u) FROM User u WHERE u.id <> :currentUserId " +
            "AND (:wing IS NULL OR :wing = '' OR SUBSTRING(u.doorNumber, 1, 1) = :wing)")
    Page<User> findResidents(@Param("currentUserId") Long currentUserId, @Param("wing") String wing, Pageable pageable);
}
