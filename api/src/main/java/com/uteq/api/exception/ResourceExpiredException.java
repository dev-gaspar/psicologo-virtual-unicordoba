package com.uteq.api.exception;

import org.springframework.http.HttpStatus;

import java.util.Map;

/**
 * Excepción para recursos expirados (410 Gone).
 * Se lanza cuando un recurso ha expirado y ya no está disponible.
 * 
 * Códigos de error comunes:
 * - CDYEXP: Código ya expirado
 * - CRQEXP: Código de solicitud expirado
 * - SLYEXP: Solicitud ya expirada
 * - SESEXP: Sesión expirada
 */
public class ResourceExpiredException extends ApiException {

    public ResourceExpiredException(String errorCode, String message) {
        super(errorCode, message, HttpStatus.GONE);
    }

    public ResourceExpiredException(String errorCode, String message, Map<String, Object> additionalData) {
        super(errorCode, message, HttpStatus.GONE, additionalData);
    }
}
