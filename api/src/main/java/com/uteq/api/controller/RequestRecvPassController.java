package com.uteq.api.controller;

import com.uteq.api.entity.RequestRecvPass;
import com.uteq.api.service.RequestRecvPassService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/request-recovery")
@RequiredArgsConstructor
public class RequestRecvPassController {
    
    private final RequestRecvPassService requestRecvPassService;
    
    @GetMapping
    public ResponseEntity<List<RequestRecvPass>> getAllRequests() {
        return ResponseEntity.ok(requestRecvPassService.findAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<RequestRecvPass> getRequestById(@PathVariable UUID id) {
        return requestRecvPassService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<RequestRecvPass> createRequest(@RequestBody RequestRecvPass requestRecvPass) {
        RequestRecvPass savedRequest = requestRecvPassService.save(requestRecvPass);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedRequest);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<RequestRecvPass> updateRequest(@PathVariable UUID id, @RequestBody RequestRecvPass requestRecvPass) {
        return requestRecvPassService.findById(id)
                .map(existingRequest -> {
                    requestRecvPass.setIdRequest(id);
                    return ResponseEntity.ok(requestRecvPassService.save(requestRecvPass));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequest(@PathVariable UUID id) {
        return requestRecvPassService.findById(id)
                .map(request -> {
                    requestRecvPassService.deleteById(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
