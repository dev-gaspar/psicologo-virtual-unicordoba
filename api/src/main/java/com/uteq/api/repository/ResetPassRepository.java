package com.uteq.api.repository;

import com.uteq.api.entity.ResetPass;
import com.uteq.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResetPassRepository extends JpaRepository<ResetPass, Integer> {
    Optional<ResetPass> findByIdRequest(UUID idRequest);
    List<ResetPass> findByUser(User user);
    List<ResetPass> findByUserAndUsed(User user, Boolean used);
}
