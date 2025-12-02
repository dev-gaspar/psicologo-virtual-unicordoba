package com.uteq.api.controller;

import com.uteq.api.entity.ResetPass;
import com.uteq.api.service.ResetPassService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reset-password")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ResetPassController {
    
    private final ResetPassService resetPassService;
    
    @GetMapping
    public ResponseEntity<List<ResetPass>> getAllResets() {
        return ResponseEntity.ok(resetPassService.findAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ResetPass> getResetById(@PathVariable Integer id) {
        return resetPassService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/request/{idRequest}")
    public ResponseEntity<ResetPass> getResetByIdRequest(@PathVariable UUID idRequest) {
        return resetPassService.findByIdRequest(idRequest)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<ResetPass> createReset(@RequestBody ResetPass resetPass) {
        ResetPass savedReset = resetPassService.save(resetPass);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedReset);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ResetPass> updateReset(@PathVariable Integer id, @RequestBody ResetPass resetPass) {
        return resetPassService.findById(id)
                .map(existingReset -> {
                    resetPass.setIdReset(id);
                    return ResponseEntity.ok(resetPassService.save(resetPass));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReset(@PathVariable Integer id) {
        return resetPassService.findById(id)
                .map(reset -> {
                    resetPassService.deleteById(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
