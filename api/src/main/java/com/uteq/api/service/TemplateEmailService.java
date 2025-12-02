package com.uteq.api.service;

import com.uteq.api.entity.TemplateEmail;
import com.uteq.api.repository.TemplateEmailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TemplateEmailService {
    
    private final TemplateEmailRepository templateEmailRepository;
    
    public List<TemplateEmail> findAll() {
        return templateEmailRepository.findAll();
    }
    
    public Optional<TemplateEmail> findById(Integer id) {
        return templateEmailRepository.findById(id);
    }
    
    public TemplateEmail save(TemplateEmail templateEmail) {
        return templateEmailRepository.save(templateEmail);
    }
    
    public void deleteById(Integer id) {
        templateEmailRepository.deleteById(id);
    }
    
    public Optional<TemplateEmail> findByTypeTempl(String typeTempl) {
        return templateEmailRepository.findByTypeTempl(typeTempl);
    }
}
