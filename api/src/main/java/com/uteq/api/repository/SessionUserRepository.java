package com.uteq.api.repository;

import com.uteq.api.entity.SessionUser;
import com.uteq.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SessionUserRepository extends JpaRepository<SessionUser, UUID> {
    List<SessionUser> findByUser(User user);
    List<SessionUser> findByUserAndIsClosed(User user, Boolean isClosed);
}
