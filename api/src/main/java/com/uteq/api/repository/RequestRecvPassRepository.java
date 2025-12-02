package com.uteq.api.repository;

import com.uteq.api.entity.RequestRecvPass;
import com.uteq.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RequestRecvPassRepository extends JpaRepository<RequestRecvPass, UUID> {
    List<RequestRecvPass> findByUser(User user);
    List<RequestRecvPass> findByUserAndUsed(User user, Boolean used);
}
