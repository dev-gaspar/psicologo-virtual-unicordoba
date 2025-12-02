package com.uteq.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pl_country")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Country {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_country")
    private Integer idCountry;
    
    @Column(name = "code_aplha2", length = 2, nullable = false, unique = true)
    private String codeAlpha2;
    
    @Column(name = "code_aplha3", length = 3, nullable = false, unique = true)
    private String codeAlpha3;
    
    @Column(name = "country", length = 75, nullable = false)
    private String country;
}
