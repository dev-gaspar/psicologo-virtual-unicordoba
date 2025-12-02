package com.uteq.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "pl_session_user")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SessionUser {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id_session")
    private UUID idSession;
    
    @ManyToOne
    @JoinColumn(name = "id_user", nullable = false)
    private User user;
    
    @Column(name = "date_register_bg", nullable = false)
    private OffsetDateTime dateRegisterBg;
    
    @Column(name = "date_register_ed")
    private OffsetDateTime dateRegisterEd;
    
    @Column(name = "is_closed", nullable = false)
    private Boolean isClosed;
    
    @PrePersist
    protected void onCreate() {
        if (dateRegisterBg == null) {
            dateRegisterBg = OffsetDateTime.now();
        }
    }
}
