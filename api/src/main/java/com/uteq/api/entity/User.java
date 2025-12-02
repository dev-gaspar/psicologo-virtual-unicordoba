package com.uteq.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "pl_user")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id_user")
    private UUID idUser;
    
    @Column(name = "full_name", length = 300, nullable = false)
    private String fullName;
    
    @Column(name = "email", length = 200, nullable = false, unique = true)
    private String email;
    
    @Column(name = "username", length = 30, nullable = false, unique = true)
    private String username;
    
    @Column(name = "password", length = 150, nullable = false)
    private String password;
    
    @ManyToOne
    @JoinColumn(name = "id_country", nullable = false)
    private Country country;
    
    @Column(name = "register_date", nullable = false)
    private OffsetDateTime registerDate;
    
    @Column(name = "is_pass_temp", nullable = false)
    private Boolean isPassTemp;
    
    @PrePersist
    protected void onCreate() {
        if (registerDate == null) {
            registerDate = OffsetDateTime.now();
        }
    }
}
