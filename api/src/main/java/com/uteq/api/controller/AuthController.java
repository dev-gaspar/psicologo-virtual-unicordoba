package com.uteq.api.controller;

import com.uteq.api.dto.*;
import com.uteq.api.service.AuthService;
import com.uteq.api.service.EmailService;
import com.uteq.api.service.RecaptchaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
        try {
            if (!recaptchaService.verifyRecaptcha(request.getRecaptchaToken())) {
                Map<String, Object> error = new HashMap<>();
                error.put("codemsg", "RCPTER");
                error.put("datauser", null);
                return ResponseEntity.badRequest().body(error);
            }
            
            Map<String, Object> result = authService.login(request.getUsername(), request.getPassword());
            
            if ("USRCCT".equals(result.get("codemsg"))) {
                try {
                    Map<String, Object> userData = (Map<String, Object>) result.get("datauser");
                    String email = (String) userData.get("email");
                    String username = (String) userData.get("username");
                    emailService.sendLoginNotificationEmail(email, username);
                } catch (Exception e) {
                    // Email error, but login was successful
                    System.err.println("Error sending login email: " + e.getMessage());
                }
                return ResponseEntity.ok(result);
            }
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("codemsg", "ERRORE");
            error.put("datauser", null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody RegisterRequest request) {
        try {
            if (!recaptchaService.verifyRecaptcha(request.getRecaptchaToken())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "RCPTER");
                return ResponseEntity.badRequest().body(error);
            }
            
            String result = authService.register(
                request.getFullName(),
                request.getEmail(),
                request.getUsername(),
                request.getPassword(),
                request.getIdCountry()
            );
            
            if ("USRREX".equals(result)) {
                try {
                    emailService.sendWelcomeEmail(request.getEmail(), request.getFullName());
                } catch (Exception e) {
                    System.err.println("Error sending welcome email: " + e.getMessage());
                }
            }
            
            Map<String, String> response = new HashMap<>();
            response.put("message", result);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "ERROR");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PostMapping("/request-recovery")
    public ResponseEntity<Map<String, Object>> requestRecovery(@RequestBody RecoveryRequest request) {
        try {
            if (!recaptchaService.verifyRecaptcha(request.getRecaptchaToken())) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "RCPTER");
                error.put("code", "");
                error.put("request_id", null);
                return ResponseEntity.badRequest().body(error);
            }
            
            Map<String, Object> result = authService.requestRecovery(request.getEmail());
            
            if ("CODGEN".equals(result.get("message"))) {
                try {
                    String code = (String) result.get("code");
                    String requestId = result.get("request_id").toString();
                    emailService.sendRecoveryCodeEmail(request.getEmail(), code, requestId);
                } catch (Exception e) {
                    System.err.println("Error sending recovery email: " + e.getMessage());
                }
            }
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "ERROR");
            error.put("code", "");
            error.put("request_id", null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PostMapping("/verify-code")
    public ResponseEntity<Map<String, Object>> verifyCode(@RequestBody VerifyCodeRequest request) {
        try {
            if (!recaptchaService.verifyRecaptcha(request.getRecaptchaToken())) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "RCPTER");
                error.put("code", "");
                error.put("request_id", null);
                return ResponseEntity.badRequest().body(error);
            }
            
            Map<String, Object> result = authService.verifyCode(request.getCodeReq(), request.getCodeGen());
            
            if ("CRQCOR".equals(result.get("message"))) {
                try {
                    String email = (String) result.get("code");
                    emailService.sendCodeVerifiedEmail(email, request.getCodeReq());
                } catch (Exception e) {
                    System.err.println("Error sending code verified email: " + e.getMessage());
                }
            }
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "ERROR");
            error.put("code", "");
            error.put("request_id", null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            if (!recaptchaService.verifyRecaptcha(request.getRecaptchaToken())) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "RCPTER");
                error.put("code", "");
                error.put("request_id", null);
                return ResponseEntity.badRequest().body(error);
            }
            
            Map<String, Object> result = authService.resetPassword(request.getCodeReq(), request.getPassword());
            
            if ("PASUEX".equals(result.get("message"))) {
                try {
                    String email = (String) result.get("code");
                    emailService.sendPasswordUpdatedEmail(email);
                } catch (Exception e) {
                    System.err.println("Error sending password updated email: " + e.getMessage());
                }
            }
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "ERROR");
            error.put("code", "");
            error.put("request_id", null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
