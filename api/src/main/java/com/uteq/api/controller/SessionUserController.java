package com.uteq.api.controller;

import java.util.List;
import java.util.UUID;

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

import com.uteq.api.entity.SessionUser;
import com.uteq.api.service.SessionUserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionUserController {
    
    private final SessionUserService sessionUserService;
    
    @GetMapping
    public ResponseEntity<List<SessionUser>> getAllSessions() {
        return ResponseEntity.ok(sessionUserService.findAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<SessionUser> getSessionById(@PathVariable UUID id) {
        return sessionUserService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<SessionUser> createSession(@RequestBody SessionUser sessionUser) {
        SessionUser savedSession = sessionUserService.save(sessionUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedSession);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<SessionUser> updateSession(@PathVariable UUID id, @RequestBody SessionUser sessionUser) {
        return sessionUserService.findById(id)
                .map(existingSession -> {
                    sessionUser.setIdSession(id);
                    return ResponseEntity.ok(sessionUserService.save(sessionUser));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable UUID id) {
        return sessionUserService.findById(id)
                .map(session -> {
                    sessionUserService.deleteById(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
