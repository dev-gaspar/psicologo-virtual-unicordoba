package com.uteq.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Entity
@Table(name = "pl_template_email")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TemplateEmail {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_template")
    private Integer idTemplate;
    
    @Column(name = "type_templ", length = 5)
    private String typeTempl;
    
    @Column(name = "template_email", columnDefinition = "TEXT")
    private String templateEmail;
    
    @Column(name = "date_register", nullable = false)
    private OffsetDateTime dateRegister;
    
    @PrePersist
    protected void onCreate() {
        if (dateRegister == null) {
            dateRegister = OffsetDateTime.now();
        }
    }
}
