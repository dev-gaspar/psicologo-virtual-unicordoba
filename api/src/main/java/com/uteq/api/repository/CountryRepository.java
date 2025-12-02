package com.uteq.api.repository;

import com.uteq.api.entity.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CountryRepository extends JpaRepository<Country, Integer> {
    Optional<Country> findByCodeAlpha2(String codeAlpha2);
    Optional<Country> findByCodeAlpha3(String codeAlpha3);
}
