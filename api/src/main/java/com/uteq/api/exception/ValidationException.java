package com.uteq.api.exception;

import org.springframework.http.HttpStatus;

import java.util.Map;

/**
 * Excepción para errores de validación (400 Bad Request).
 * Se lanza cuando los datos proporcionados por el usuario no cumplen con las
 * reglas de validación.
 * 
 * Códigos de error comunes:
 * - EMLYRG: Email ya registrado
 * - NUSYRG: Nombre de usuario ya registrado
 * - USNVLD: Usuario no válido
 * - FNMNVD: Nombre completo no válido
 * - EMLNVD: Email no válido
 * - NUSNVD: Nombre de usuario no válido
 * - CTRNVD: País no válido
 * - ERRDSC: Error desconocido
 * - CDNIGL: Código no igual
 * - CODNVD: Código no válido
 * - CRQNVD: Código de solicitud no válido
 * - CGNNVD: Código generado no válido
 * - CRQINV: Código de solicitud inválido
 * - PASNVD: Contraseña no válida
 * - PSWINC: Contraseña incorrecta
 * - PSWNVD: Contraseña no válida
 * - PSWEQS: Contraseñas iguales (no se puede usar la misma)
 * - IDUNVD: ID de usuario no válido
 * - IDSNVD: ID de sesión no válido
 */
public class ValidationException extends ApiException {

    public ValidationException(String errorCode, String message) {
        super(errorCode, message, HttpStatus.BAD_REQUEST);
    }

    public ValidationException(String errorCode, String message, Map<String, Object> additionalData) {
        super(errorCode, message, HttpStatus.BAD_REQUEST, additionalData);
    }
}
