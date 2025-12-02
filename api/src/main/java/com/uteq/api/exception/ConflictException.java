package com.uteq.api.exception;

import org.springframework.http.HttpStatus;

import java.util.Map;

/**
 * Excepción para conflictos (409 Conflict).
 * Se lanza cuando existe un conflicto con el estado actual del recurso.
 * 
 * Códigos de error comunes:
 * - CDNEXP: Código no expirado (ya existe uno activo)
 * - SUNEXP: Solicitud no expirada (ya existe una activa)
 * - CRQYUS: Código de solicitud ya usado
 */
public class ConflictException extends ApiException {

    public ConflictException(String errorCode, String message) {
        super(errorCode, message, HttpStatus.CONFLICT);
    }

    public ConflictException(String errorCode, String message, Map<String, Object> additionalData) {
        super(errorCode, message, HttpStatus.CONFLICT, additionalData);
    }
}
