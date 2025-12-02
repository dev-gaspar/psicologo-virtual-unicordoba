package com.uteq.api.controller;

import com.uteq.api.entity.Country;
import com.uteq.api.service.CountryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/countries")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CountryController {
    
    private final CountryService countryService;
    
    @GetMapping
    public ResponseEntity<List<Country>> getAllCountries() {
        return ResponseEntity.ok(countryService.findAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Country> getCountryById(@PathVariable Integer id) {
        return countryService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/alpha2/{code}")
    public ResponseEntity<Country> getCountryByAlpha2(@PathVariable String code) {
        return countryService.findByCodeAlpha2(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/alpha3/{code}")
    public ResponseEntity<Country> getCountryByAlpha3(@PathVariable String code) {
        return countryService.findByCodeAlpha3(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Country> createCountry(@RequestBody Country country) {
        Country savedCountry = countryService.save(country);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCountry);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Country> updateCountry(@PathVariable Integer id, @RequestBody Country country) {
        return countryService.findById(id)
                .map(existingCountry -> {
                    country.setIdCountry(id);
                    return ResponseEntity.ok(countryService.save(country));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCountry(@PathVariable Integer id) {
        return countryService.findById(id)
                .map(country -> {
                    countryService.deleteById(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
