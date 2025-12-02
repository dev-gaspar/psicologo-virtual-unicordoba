package com.uteq.api.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.Map;

/**
 * Clase base para todas las excepciones de negocio de la API.
 * Encapsula el código de error del negocio, el mensaje descriptivo,
 * el código HTTP apropiado y datos adicionales.
 */
@Getter
public class ApiException extends RuntimeException {

    private final String errorCode;
    private final HttpStatus httpStatus;
    private final Map<String, Object> additionalData;

    public ApiException(String errorCode, String message, HttpStatus httpStatus) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
        this.additionalData = new HashMap<>();
    }

    public ApiException(String errorCode, String message, HttpStatus httpStatus, Map<String, Object> additionalData) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
        this.additionalData = additionalData != null ? additionalData : new HashMap<>();
    }

    public void addData(String key, Object value) {
        this.additionalData.put(key, value);
    }
}
