package com.uteq.api.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.uteq.api.entity.TemplateEmail;
import com.uteq.api.service.TemplateEmailService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class TemplateEmailController {
    
    private final TemplateEmailService templateEmailService;
    
    @GetMapping
    public ResponseEntity<List<TemplateEmail>> getAllTemplates() {
        return ResponseEntity.ok(templateEmailService.findAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TemplateEmail> getTemplateById(@PathVariable Integer id) {
        return templateEmailService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/type/{type}")
    public ResponseEntity<TemplateEmail> getTemplateByType(@PathVariable String type) {
        return templateEmailService.findByTypeTempl(type)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<TemplateEmail> createTemplate(@RequestBody TemplateEmail templateEmail) {
        TemplateEmail savedTemplate = templateEmailService.save(templateEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTemplate);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<TemplateEmail> updateTemplate(@PathVariable Integer id, @RequestBody TemplateEmail templateEmail) {
        return templateEmailService.findById(id)
                .map(existingTemplate -> {
                    templateEmail.setIdTemplate(id);
                    return ResponseEntity.ok(templateEmailService.save(templateEmail));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Integer id) {
        return templateEmailService.findById(id)
                .map(template -> {
                    templateEmailService.deleteById(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
