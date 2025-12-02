package com.uteq.api.repository;

import com.uteq.api.entity.TemplateEmail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TemplateEmailRepository extends JpaRepository<TemplateEmail, Integer> {
    Optional<TemplateEmail> findByTypeTempl(String typeTempl);
}
