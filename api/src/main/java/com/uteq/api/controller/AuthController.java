package com.uteq.api.controller;

import com.uteq.api.dto.*;
import com.uteq.api.exception.*;
import com.uteq.api.service.AuthService;
import com.uteq.api.service.EmailService;
import com.uteq.api.service.RecaptchaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final RecaptchaService recaptchaService;
    private final EmailService emailService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        // Verificar reCAPTCHA
        if (!recaptchaService.verifyRecaptcha(request.getRecaptchaToken())) {
            throw new AuthenticationException("RCPTER", "reCAPTCHA verification failed");
        }

        Map<String, Object> result = authService.login(request.getUsername(), request.getPassword());
        String codemsg = (String) result.get("codemsg");

        // Lanzar excepciones según el código de error
        switch (codemsg) {
            case "USNVLD":
                throw new ValidationException("USNVLD", "Nombre de usuario no válido");
            case "PSWNVD":
                throw new ValidationException("PSWNVD", "Contraseña no válida");
            case "USRNEX":
                throw new ResourceNotFoundException("USRNEX", "Usuario no existe");
            case "PSWINC":
                throw new AuthenticationException("PSWINC", "Contraseña incorrecta");
            case "ERRORE":
                throw new RuntimeException("Error interno del sistema");
            case "USRCCT":
                // Login exitoso - enviar email de notificación
                try {
                    Map<String, Object> userData = (Map<String, Object>) result.get("datauser");
                    String email = (String) userData.get("email");
                    String username = (String) userData.get("username");
                    emailService.sendLoginNotificationEmail(email, username);
                } catch (Exception e) {
                    System.err.println("Error sending login email: " + e.getMessage());
                }
                return ResponseEntity.ok(result);
            default:
                throw new RuntimeException("Código de respuesta desconocido: " + codemsg);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody RegisterRequest request) {
        // Verificar reCAPTCHA
        if (!recaptchaService.verifyRecaptcha(request.getRecaptchaToken())) {
            throw new AuthenticationException("RCPTER", "reCAPTCHA verification failed");
        }

        String result = authService.register(
                request.getFullName(),
                request.getEmail(),
                request.getUsername(),
                request.getPassword(),
                request.getIdCountry());

        // Lanzar excepciones según el código de error
        switch (result) {
            case "FNMNVD":
                throw new ValidationException("FNMNVD", "Nombre completo no válido");
            case "EMLNVD":
                throw new ValidationException("EMLNVD", "Email no válido");
            case "NUSNVD":
                throw new ValidationException("NUSNVD", "Nombre de usuario no válido");
            case "PSWNVD":
                throw new ValidationException("PSWNVD", "Contraseña no válida");
            case "CTRNVD":
                throw new ValidationException("CTRNVD", "País no válido");
            case "EMLYRG":
                throw new ValidationException("EMLYRG", "Email ya registrado");
            case "NUSYRG":
                throw new ValidationException("NUSYRG", "Nombre de usuario ya registrado");
            case "ERRDSC":
                throw new ValidationException("ERRDSC", "Error desconocido");
            case "USRREX":
                // Registro exitoso - enviar email de bienvenida
                try {
                    emailService.sendWelcomeEmail(request.getEmail(), request.getFullName());
                } catch (Exception e) {
                    System.err.println("Error sending welcome email: " + e.getMessage());
                }
                Map<String, String> response = new HashMap<>();
                response.put("message", result);
                return ResponseEntity.ok(response);
            default:
                throw new RuntimeException("Código de respuesta desconocido: " + result);
        }
    }

    @PostMapping("/request-recovery")
    public ResponseEntity<Map<String, Object>> requestRecovery(@RequestBody RecoveryRequest request) {
        // Verificar reCAPTCHA
        if (!recaptchaService.verifyRecaptcha(request.getRecaptchaToken())) {
            throw new AuthenticationException("RCPTER", "reCAPTCHA verification failed");
        }

        Map<String, Object> result = authService.requestRecovery(request.getEmail());
        String messageCode = (String) result.get("message");

        // Lanzar excepciones según el código de error
        switch (messageCode) {
            case "EMLNVD":
                throw new ValidationException("EMLNVD", "Email no válido");
            case "EMLNEX":
                throw new ResourceNotFoundException("EMLNEX", "Email no existe");
            case "CDNEXP":
                throw new ConflictException("CDNEXP", "Ya existe un código de recuperación activo");
            case "SUNEXP":
                throw new ConflictException("SUNEXP", "Ya existe una solicitud de recuperación activa");
            case "CODGEN":
                // Código generado exitosamente - enviar email
                try {
                    String code = (String) result.get("code");
                    String requestId = result.get("request_id").toString();
                    emailService.sendRecoveryCodeEmail(request.getEmail(), code, requestId);
                } catch (Exception e) {
                    System.err.println("Error sending recovery email: " + e.getMessage());
                }
                return ResponseEntity.ok(result);
            default:
                throw new RuntimeException("Código de respuesta desconocido: " + messageCode);
        }
    }

    @PostMapping("/verify-code")
    public ResponseEntity<Map<String, Object>> verifyCode(@RequestBody VerifyCodeRequest request) {
        // Verificar reCAPTCHA
        if (!recaptchaService.verifyRecaptcha(request.getRecaptchaToken())) {
            throw new AuthenticationException("RCPTER", "reCAPTCHA verification failed");
        }

        Map<String, Object> result = authService.verifyCode(request.getCodeReq(), request.getCodeGen());
        String messageCode = (String) result.get("message");

        // Lanzar excepciones según el código de error
        switch (messageCode) {
            case "CRQNVD":
                throw new ValidationException("CRQNVD", "Código de solicitud no válido");
            case "CGNNVD":
                throw new ValidationException("CGNNVD", "Código generado no válido");
            case "CRQNEX":
                throw new ResourceNotFoundException("CRQNEX", "Código de solicitud no existe");
            case "CDNIGL":
                throw new ValidationException("CDNIGL", "Código no coincide");
            case "CDYEXP":
                throw new ResourceExpiredException("CDYEXP", "Código ya expirado");
            case "CRQEXP":
                throw new ResourceExpiredException("CRQEXP", "Código de solicitud expirado");
            case "CRQINV":
                throw new ValidationException("CRQINV", "Código de solicitud inválido");
            case "CRQCOR":
                // Código verificado exitosamente - enviar email
                try {
                    String email = (String) result.get("code");
                    emailService.sendCodeVerifiedEmail(email, request.getCodeReq());
                } catch (Exception e) {
                    System.err.println("Error sending code verified email: " + e.getMessage());
                }
                return ResponseEntity.ok(result);
            default:
                throw new RuntimeException("Código de respuesta desconocido: " + messageCode);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody ResetPasswordRequest request) {
        // Verificar reCAPTCHA
        if (!recaptchaService.verifyRecaptcha(request.getRecaptchaToken())) {
            throw new AuthenticationException("RCPTER", "reCAPTCHA verification failed");
        }

        Map<String, Object> result = authService.resetPassword(request.getCodeReq(), request.getPassword());
        String messageCode = (String) result.get("message");

        // Lanzar excepciones según el código de error
        switch (messageCode) {
            case "CRQNVD":
                throw new ValidationException("CRQNVD", "Código de solicitud no válido");
            case "PASNVD":
                throw new ValidationException("PASNVD", "Contraseña no válida");
            case "CRQNEX":
                throw new ResourceNotFoundException("CRQNEX", "Código de solicitud no existe");
            case "SLYEXP":
                throw new ResourceExpiredException("SLYEXP", "Solicitud ya expirada");
            case "CRQEXP":
                throw new ResourceExpiredException("CRQEXP", "Código de solicitud expirado");
            case "PSWEQS":
                throw new ValidationException("PSWEQS", "La nueva contraseña no puede ser igual a la anterior");
            case "CRQINV":
                throw new ValidationException("CRQINV", "Código de solicitud inválido");
            case "PASUEX":
                // Contraseña actualizada exitosamente - enviar email
                try {
                    String email = (String) result.get("code");
                    emailService.sendPasswordUpdatedEmail(email);
                } catch (Exception e) {
                    System.err.println("Error sending password updated email: " + e.getMessage());
                }
                return ResponseEntity.ok(result);
            default:
                throw new RuntimeException("Código de respuesta desconocido: " + messageCode);
        }
    }
}
