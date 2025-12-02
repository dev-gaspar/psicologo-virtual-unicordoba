package com.uteq.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "pl_request_recv_pass")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequestRecvPass {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id_request")
    private UUID idRequest;
    
    @Column(name = "date_register", nullable = false)
    private OffsetDateTime dateRegister;
    
    @Column(name = "date_expired", nullable = false)
    private OffsetDateTime dateExpired;
    
    @ManyToOne
    @JoinColumn(name = "id_user", nullable = false)
    private User user;
    
    @Column(name = "generated_code", length = 6, nullable = false)
    private String generatedCode;
    
    @Column(name = "used", nullable = false)
    private Boolean used;
    
    @PrePersist
    protected void onCreate() {
        if (dateRegister == null) {
            dateRegister = OffsetDateTime.now();
        }
    }
}
