package com.uteq.api.service;

import com.uteq.api.entity.SessionUser;
import com.uteq.api.entity.User;
import com.uteq.api.repository.SessionUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionUserService {
    
    private final SessionUserRepository sessionUserRepository;
    
    public List<SessionUser> findAll() {
        return sessionUserRepository.findAll();
    }
    
    public Optional<SessionUser> findById(UUID id) {
        return sessionUserRepository.findById(id);
    }
    
    public SessionUser save(SessionUser sessionUser) {
        return sessionUserRepository.save(sessionUser);
    }
    
    public void deleteById(UUID id) {
        sessionUserRepository.deleteById(id);
    }
    
    public List<SessionUser> findByUser(User user) {
        return sessionUserRepository.findByUser(user);
    }
    
    public List<SessionUser> findByUserAndIsClosed(User user, Boolean isClosed) {
        return sessionUserRepository.findByUserAndIsClosed(user, isClosed);
    }
}
