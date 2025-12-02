package com.uteq.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * DTO para respuestas de error estándar de la API.
 * Incluye campos flexibles para adaptarse a diferentes formatos de respuesta.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    /**
     * Código de error del negocio (ej: EMLYRG, NUSYRG, USRNEX, etc.)
     */
    private String message;

    /**
     * Campo adicional usado en algunos endpoints (email, etc.)
     */
    private String code;

    /**
     * UUID de solicitud (solo para endpoints de recuperación)
     */
    private Object requestId;

    /**
     * Datos de usuario (solo para endpoint de login)
     */
    private Object datauser;

    /**
     * Código de mensaje alternativo (usado en endpoint de login)
     */
    private String codemsg;

    /**
     * Datos adicionales personalizados
     */
    private Map<String, Object> additionalData;
}
