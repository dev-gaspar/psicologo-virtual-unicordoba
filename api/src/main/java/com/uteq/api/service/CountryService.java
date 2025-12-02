package com.uteq.api.service;

import com.uteq.api.entity.Country;
import com.uteq.api.repository.CountryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CountryService {
    
    private final CountryRepository countryRepository;
    
    public List<Country> findAll() {
        return countryRepository.findAll();
    }
    
    public Optional<Country> findById(Integer id) {
        return countryRepository.findById(id);
    }
    
    public Country save(Country country) {
        return countryRepository.save(country);
    }
    
    public void deleteById(Integer id) {
        countryRepository.deleteById(id);
    }
    
    public Optional<Country> findByCodeAlpha2(String codeAlpha2) {
        return countryRepository.findByCodeAlpha2(codeAlpha2);
    }
    
    public Optional<Country> findByCodeAlpha3(String codeAlpha3) {
        return countryRepository.findByCodeAlpha3(codeAlpha3);
    }
}
