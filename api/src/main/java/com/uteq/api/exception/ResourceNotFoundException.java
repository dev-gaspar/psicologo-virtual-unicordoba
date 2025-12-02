package com.uteq.api.exception;

import org.springframework.http.HttpStatus;

import java.util.Map;

/**
 * Excepción para recursos no encontrados (404 Not Found).
 * Se lanza cuando un recurso solicitado no existe en el sistema.
 * 
 * Códigos de error comunes:
 * - USRNEX: Usuario no existe
 * - EMLNEX: Email no existe
 * - CODNEX: Código no existe
 * - CRQNEX: Código de solicitud no existe
 * - SESNEX: Sesión no existe
 */
public class ResourceNotFoundException extends ApiException {

    public ResourceNotFoundException(String errorCode, String message) {
        super(errorCode, message, HttpStatus.NOT_FOUND);
    }

    public ResourceNotFoundException(String errorCode, String message, Map<String, Object> additionalData) {
        super(errorCode, message, HttpStatus.NOT_FOUND, additionalData);
    }
}
