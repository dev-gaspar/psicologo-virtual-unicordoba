package com.uteq.api.service;

import com.uteq.api.entity.RequestRecvPass;
import com.uteq.api.entity.User;
import com.uteq.api.repository.RequestRecvPassRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RequestRecvPassService {
    
    private final RequestRecvPassRepository requestRecvPassRepository;
    
    public List<RequestRecvPass> findAll() {
        return requestRecvPassRepository.findAll();
    }
    
    public Optional<RequestRecvPass> findById(UUID id) {
        return requestRecvPassRepository.findById(id);
    }
    
    public RequestRecvPass save(RequestRecvPass requestRecvPass) {
        return requestRecvPassRepository.save(requestRecvPass);
    }
    
    public void deleteById(UUID id) {
        requestRecvPassRepository.deleteById(id);
    }
    
    public List<RequestRecvPass> findByUser(User user) {
        return requestRecvPassRepository.findByUser(user);
    }
    
    public List<RequestRecvPass> findByUserAndUsed(User user, Boolean used) {
        return requestRecvPassRepository.findByUserAndUsed(user, used);
    }
}
