package com.uteq.api.exception;

import com.uteq.api.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

/**
 * Manejador global de excepciones para toda la API.
 * Intercepta todas las excepciones lanzadas por los controladores
 * y devuelve respuestas HTTP apropiadas con códigos de estado correctos.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Maneja excepciones de validación (400 Bad Request)
     */
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<Object> handleValidationException(ValidationException ex, WebRequest request) {
        logger.warn("Validation error: {} - {}", ex.getErrorCode(), ex.getMessage());
        return buildErrorResponse(ex);
    }

    /**
     * Maneja excepciones de recurso no encontrado (404 Not Found)
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Object> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        logger.warn("Resource not found: {} - {}", ex.getErrorCode(), ex.getMessage());
        return buildErrorResponse(ex);
    }

    /**
     * Maneja excepciones de conflicto (409 Conflict)
     */
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<Object> handleConflictException(ConflictException ex, WebRequest request) {
        logger.warn("Conflict error: {} - {}", ex.getErrorCode(), ex.getMessage());
        return buildErrorResponse(ex);
    }

    /**
     * Maneja excepciones de recurso expirado (410 Gone)
     */
    @ExceptionHandler(ResourceExpiredException.class)
    public ResponseEntity<Object> handleResourceExpiredException(ResourceExpiredException ex, WebRequest request) {
        logger.warn("Resource expired: {} - {}", ex.getErrorCode(), ex.getMessage());
        return buildErrorResponse(ex);
    }

    /**
     * Maneja excepciones de autenticación (401 Unauthorized)
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Object> handleAuthenticationException(AuthenticationException ex, WebRequest request) {
        logger.warn("Authentication error: {} - {}", ex.getErrorCode(), ex.getMessage());
        return buildErrorResponse(ex);
    }

    /**
     * Maneja excepciones genéricas no capturadas (500 Internal Server Error)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGenericException(Exception ex, WebRequest request) {
        logger.error("Unexpected error occurred", ex);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .message("ERROR")
                .code("")
                .requestId(null)
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

    /**
     * Construye la respuesta de error basada en la excepción de la API
     */
    private ResponseEntity<Object> buildErrorResponse(ApiException ex) {
        ErrorResponse.ErrorResponseBuilder builder = ErrorResponse.builder()
                .message(ex.getErrorCode());

        // Agregar datos adicionales si existen
        if (ex.getAdditionalData() != null && !ex.getAdditionalData().isEmpty()) {
            // Verificar si hay datos específicos del endpoint de login
            if (ex.getAdditionalData().containsKey("datauser")) {
                builder.codemsg(ex.getErrorCode())
                        .datauser(ex.getAdditionalData().get("datauser"));
            } else {
                // Para endpoints de recuperación y otros
                builder.code(ex.getAdditionalData().getOrDefault("code", "").toString())
                        .requestId(ex.getAdditionalData().get("request_id"));
            }
        } else {
            // Valores por defecto para mantener compatibilidad
            builder.code("")
                    .requestId(null);
        }

        ErrorResponse errorResponse = builder.build();
        return ResponseEntity.status(ex.getHttpStatus()).body(errorResponse);
    }
}
