package com.uteq.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Configuración para el codificador de contraseñas BCrypt.
 * BCrypt es un algoritmo de hashing seguro diseñado específicamente para
 * contraseñas.
 * 
 * Características:
 * - Hashing adaptativo (el factor de trabajo puede aumentar con el tiempo)
 * - Genera un salt aleatorio automáticamente para cada contraseña
 * - Resistente a ataques de rainbow tables y fuerza bruta
 */
@Configuration
public class PasswordConfig {

    /**
     * Crea un bean de PasswordEncoder usando BCrypt con strength 12.
     * 
     * Strength (factor de trabajo):
     * - 10: Rápido, seguridad básica
     * - 12: Balanceado (recomendado para la mayoría de aplicaciones)
     * - 14+: Muy seguro pero más lento
     * 
     * @return BCryptPasswordEncoder configurado
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
