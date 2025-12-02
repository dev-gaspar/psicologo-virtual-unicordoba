package com.uteq.api.exception;

import org.springframework.http.HttpStatus;

import java.util.Map;

/**
 * Excepción para errores de autenticación (401 Unauthorized).
 * Se lanza cuando las credenciales son inválidas o la autenticación falla.
 * 
 * Códigos de error comunes:
 * - USRERR: Error de usuario
 * - USRINV: Usuario inválido
 * - RCPTER: Error de reCAPTCHA
 */
public class AuthenticationException extends ApiException {

    public AuthenticationException(String errorCode, String message) {
        super(errorCode, message, HttpStatus.UNAUTHORIZED);
    }

    public AuthenticationException(String errorCode, String message, Map<String, Object> additionalData) {
        super(errorCode, message, HttpStatus.UNAUTHORIZED, additionalData);
    }
}
