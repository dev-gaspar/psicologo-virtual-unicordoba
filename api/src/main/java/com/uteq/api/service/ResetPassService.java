package com.uteq.api.service;

import com.uteq.api.entity.ResetPass;
import com.uteq.api.entity.User;
import com.uteq.api.repository.ResetPassRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResetPassService {
    
    private final ResetPassRepository resetPassRepository;
    
    public List<ResetPass> findAll() {
        return resetPassRepository.findAll();
    }
    
    public Optional<ResetPass> findById(Integer id) {
        return resetPassRepository.findById(id);
    }
    
    public ResetPass save(ResetPass resetPass) {
        return resetPassRepository.save(resetPass);
    }
    
    public void deleteById(Integer id) {
        resetPassRepository.deleteById(id);
    }
    
    public Optional<ResetPass> findByIdRequest(UUID idRequest) {
        return resetPassRepository.findByIdRequest(idRequest);
    }
    
    public List<ResetPass> findByUser(User user) {
        return resetPassRepository.findByUser(user);
    }
    
    public List<ResetPass> findByUserAndUsed(User user, Boolean used) {
        return resetPassRepository.findByUserAndUsed(user, used);
    }
}
