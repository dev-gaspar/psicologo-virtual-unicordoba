package com.uteq.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "pl_reset_pass")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResetPass {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reset")
    private Integer idReset;
    
    @ManyToOne
    @JoinColumn(name = "id_user", nullable = false)
    private User user;
    
    @Column(name = "id_request", nullable = false, unique = true)
    private UUID idRequest;
    
    @Column(name = "date_creation", nullable = false)
    private OffsetDateTime dateCreation;
    
    @Column(name = "date_expired", nullable = false)
    private OffsetDateTime dateExpired;
    
    @Column(name = "date_registration")
    private OffsetDateTime dateRegistration;
    
    @Column(name = "old_password", length = 150, nullable = false)
    private String oldPassword;
    
    @Column(name = "new_password", length = 150)
    private String newPassword;
    
    @Column(name = "used", nullable = false)
    private Boolean used;
    
    @PrePersist
    protected void onCreate() {
        if (dateCreation == null) {
            dateCreation = OffsetDateTime.now();
        }
    }
}
