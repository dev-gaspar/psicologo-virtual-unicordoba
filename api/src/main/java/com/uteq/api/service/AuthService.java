package com.uteq.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final EntityManager entityManager;
    private final ObjectMapper objectMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final com.uteq.api.repository.UserRepository userRepository;

    @Transactional
    public Map<String, Object> login(String username, String rawPassword) {
        // Estrategia de Login Híbrida (BCrypt + Legacy Stored Procedure)

        String passwordForSp = rawPassword;

        try {
            // 1. Obtener la contraseña almacenada para este usuario
            com.uteq.api.entity.User user = userRepository.findByUsername(username).orElse(null);

            if (user != null) {
                String storedPassword = user.getPassword();

                // 2. Verificar si es BCrypt (empieza con $2a$, $2b$, $2y$)
                if (storedPassword != null && (storedPassword.startsWith("$2a$") ||
                        storedPassword.startsWith("$2b$") ||
                        storedPassword.startsWith("$2y$"))) {
                    // 3. Verificar contraseña en Java
                    if (passwordEncoder.matches(rawPassword.trim(), storedPassword.trim())) {
                        // Contraseña correcta!
                        // Truco: Pasamos el HASH al stored procedure para que la comparación (hash ==
                        // hash) sea verdadera
                        passwordForSp = storedPassword;
                    } else {
                        // Contraseña incorrecta
                        Map<String, Object> error = new HashMap<>();
                        error.put("codemsg", "PSWINC");
                        error.put("datauser", null);
                        return error;
                    }
                }
            }

            // 4. Llamar al Stored Procedure (con rawPassword para legacy, o storedHash para
            // BCrypt)
            String sql = "SELECT CAST(us_check_information_user_for_login(:in_username, :in_password) AS TEXT)";
            String jsonResult = (String) entityManager.createNativeQuery(sql)
                    .setParameter("in_username", username)
                    .setParameter("in_password", passwordForSp)
                    .getSingleResult();

            JsonNode jsonNode = objectMapper.readTree(jsonResult);
            String codemsg = jsonNode.get("codemsg").asText();

            // Si el stored procedure devuelve éxito, procesamos
            if ("USRCCT".equals(codemsg)) {
                @SuppressWarnings("unchecked")
                Map<String, Object> userData = objectMapper.convertValue(jsonNode.get("datauser"), Map.class);

                // Generar JWT token
                UUID userId = UUID.fromString((String) userData.get("id_user"));
                String email = (String) userData.get("email");
                String usernameFinal = (String) userData.get("username");
                UUID sessionId = UUID.fromString((String) userData.get("id_session"));

                String jwtToken = jwtService.generateToken(userId, email, usernameFinal, sessionId);
                String refreshToken = jwtService.generateRefreshToken(userId, sessionId);

                // Agregar tokens a la respuesta
                userData.put("token", jwtToken);
                userData.put("refreshToken", refreshToken);

                Map<String, Object> result = new HashMap<>();
                result.put("codemsg", "USRCCT");
                result.put("datauser", userData);

                return result;
            } else if ("PSWINC".equals(codemsg)) {
                // Contraseña incorrecta
                Map<String, Object> error = new HashMap<>();
                error.put("codemsg", "PSWINC");
                error.put("datauser", null);
                return error;
            } else {
                // Otros errores (USNVLD, USRNEX, etc.)
                Map<String, Object> result = new HashMap<>();
                result.put("codemsg", codemsg);
                result.put("datauser", jsonNode.has("datauser") && !jsonNode.get("datauser").isNull()
                        ? objectMapper.convertValue(jsonNode.get("datauser"), Map.class)
                        : null);
                return result;
            }
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("codemsg", "ERRORE");
            error.put("datauser", null);
            return error;
        }
    }

    @Transactional
    public String register(String fullName, String email, String username, String password, Integer idCountry) {
        try {
            // Hashear la contraseña antes de enviar al stored procedure
            String hashedPassword = passwordEncoder.encode(password.trim());

            String sql = "SELECT us_register_new_user_data(:us_full_name, :us_email, :us_username, :us_password, :us_id_country)";
            return (String) entityManager.createNativeQuery(sql)
                    .setParameter("us_full_name", fullName)
                    .setParameter("us_email", email)
                    .setParameter("us_username", username)
                    .setParameter("us_password", hashedPassword)
                    .setParameter("us_id_country", idCountry)
                    .getSingleResult();
        } catch (Exception e) {
            System.err.println("Error in register function: " + e.getMessage());
            e.printStackTrace();
            return "ERROR: " + e.getMessage();
        }
    }

    @Transactional
    public Map<String, Object> requestRecovery(String email) {
        String sql = "SELECT CAST(us_request_recovery_password_to_user_v2(:us_email) AS TEXT)";
        String jsonResult = (String) entityManager.createNativeQuery(sql)
                .setParameter("us_email", email)
                .getSingleResult();

        try {
            return objectMapper.readValue(jsonResult, Map.class);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "ERROR");
            error.put("code", "");
            error.put("request_id", null);
            return error;
        }
    }

    @Transactional
    public Map<String, Object> verifyCode(String codeReq, String codeGen) {
        String sql = "SELECT CAST(us_check_recovery_code_v2(:code_req, :code_gen) AS TEXT)";
        String jsonResult = (String) entityManager.createNativeQuery(sql)
                .setParameter("code_req", codeReq)
                .setParameter("code_gen", codeGen)
                .getSingleResult();

        try {
            return objectMapper.readValue(jsonResult, Map.class);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "ERROR");
            error.put("code", "");
            error.put("request_id", null);
            return error;
        }
    }

    @Transactional
    public Map<String, Object> resetPassword(String codeReq, String password) {
        try {
            String rawPassword = password.trim();
            
            // 1. Validaciones básicas
            if (codeReq == null || codeReq.isBlank()) {
                return buildErrorResponse("CRQNVD");
            }
            if (rawPassword.isEmpty()) {
                return buildErrorResponse("PASNVD");
            }
            
            UUID codeUuid;
            try {
                codeUuid = UUID.fromString(codeReq.trim());
            } catch (IllegalArgumentException e) {
                return buildErrorResponse("CRQINV");
            }
            
            // 2. Obtener información del reset y del usuario (Agregamos u.username para validación legacy)
            String sqlGetResetInfo = "SELECT u.id_user, u.password, u.email, r.date_expired, u.username " +
                    "FROM pl_reset_pass r " +
                    "JOIN pl_user u ON r.id_user = u.id_user " +
                    "WHERE r.id_request = :code_req AND r.used = FALSE";
            
            Object[] resetInfo;
            try {
                resetInfo = (Object[]) entityManager.createNativeQuery(sqlGetResetInfo)
                        .setParameter("code_req", codeUuid)
                        .getSingleResult();
            } catch (Exception e) {
                log.warn("Reset request not found or query failed: {}", e.getMessage());
                return buildErrorResponse("CRQNEX");
            }
            
            if (resetInfo == null || resetInfo.length < 5) {
                return buildErrorResponse("CRQNEX");
            }
            
            UUID userId = (UUID) resetInfo[0];
            String currentPasswordHashInDB = (String) resetInfo[1];
            String userEmail = (String) resetInfo[2];
            Object dateExpiredObj = resetInfo[3];
            String username = (String) resetInfo[4];
            
            // 3. Validar expiración
            Instant expiryInstant = null;
            if (dateExpiredObj instanceof java.time.OffsetDateTime) {
                expiryInstant = ((java.time.OffsetDateTime) dateExpiredObj).toInstant();
            } else if (dateExpiredObj instanceof java.sql.Timestamp) {
                expiryInstant = ((java.sql.Timestamp) dateExpiredObj).toInstant();
            } else if (dateExpiredObj instanceof java.time.Instant) {
                expiryInstant = (java.time.Instant) dateExpiredObj;
            }
            
            if (expiryInstant != null && expiryInstant.isBefore(java.time.Instant.now())) {
                log.info("Solicitud de recuperación expirada para usuario: {}", userEmail);
                return buildErrorResponse("SLYEXP");
            }
            
            // 4. VALIDACIÓN DE SEGURIDAD MEJORADA
            // 4.1 Verificar contra la contraseña ACTUAL (Soporte Híbrido: BCrypt o Legacy)
            if (isPasswordMatch(rawPassword, currentPasswordHashInDB, username)) {
                log.info("La nueva contraseña es igual a la actual (User: {})", username);
                return buildErrorResponse("PSWEQS");
            }

            // 4.2 Verificar contra el HISTORIAL (Últimas 5 contraseñas en pl_reset_pass)
            // Se asume que 'old_password' guarda el hash que tenía el usuario al momento del reset
            String sqlHistory = "SELECT old_password FROM pl_reset_pass " +
                                "WHERE id_user = :userId AND old_password IS NOT NULL " +
                                "ORDER BY date_registration DESC LIMIT 5";
            
            @SuppressWarnings("unchecked")
            java.util.List<String> historyHashes = entityManager.createNativeQuery(sqlHistory)
                    .setParameter("userId", userId)
                    .getResultList();

            for (String historyHash : historyHashes) {
                // Para el historial, asumimos validación estándar BCrypt
                // (Si hay legacy en el historial muy antiguo, se ignora por seguridad para no bloquear falsos positivos)
                if (historyHash != null && isBCrypt(historyHash) && passwordEncoder.matches(rawPassword, historyHash)) {
                    log.info("La nueva contraseña coincide con una del historial reciente.");
                    return buildErrorResponse("PSWEQS");
                }
            }
            
            // 5. Proceder al cambio
            // Hashear la nueva contraseña
            String newHashedPassword = passwordEncoder.encode(rawPassword);
            
            // Actualizar tabla reset_pass
            String updateResetPassSql = "UPDATE pl_reset_pass " +
                    "SET date_registration = NOW(), new_password = :newPass, used = TRUE " +
                    "WHERE id_request = :code_req";
            
            entityManager.createNativeQuery(updateResetPassSql)
                    .setParameter("newPass", newHashedPassword)
                    .setParameter("code_req", codeUuid)
                    .executeUpdate();
            
            // Actualizar tabla usuario
            String updateUserSql = "UPDATE pl_user SET password = :newPass WHERE id_user = :user_id";
            
            entityManager.createNativeQuery(updateUserSql)
                    .setParameter("newPass", newHashedPassword)
                    .setParameter("user_id", userId)
                    .executeUpdate();
            
            log.info("Contraseña actualizada exitosamente para usuario: {}", userEmail);
            
            Map<String, Object> response = new HashMap<>();
            response.put("codemsg", "PASUEX");
            response.put("message", "Password updated successfully");
            response.put("email", userEmail);
            return response;
            
        } catch (Exception e) {
            log.error("Error crítico en resetPassword: ", e);
            return buildErrorResponse("ERRORE");
        }
    }

    /**
     * Verifica si una contraseña plana coincide con el hash almacenado,
     * soportando tanto BCrypt como la estrategia Legacy vía Stored Procedure.
     */
    private boolean isPasswordMatch(String rawPassword, String storedHash, String username) {
        if (storedHash == null) return false;

        // Estrategia 1: Es un hash BCrypt estándar
        if (isBCrypt(storedHash)) {
            return passwordEncoder.matches(rawPassword, storedHash);
        }

        // Estrategia 2: Es Legacy (no empieza con $2...), verificamos usando el SP de Login
        // Si el SP retorna USRCCT usando la nueva password candidata, significa que ES IGUAL a la almacenada.
        try {
            String sql = "SELECT CAST(us_check_information_user_for_login(:in_username, :in_password) AS TEXT)";
            String jsonResult = (String) entityManager.createNativeQuery(sql)
                    .setParameter("in_username", username)
                    .setParameter("in_password", rawPassword) // Probamos con la password plana
                    .getSingleResult();
            
            JsonNode jsonNode = objectMapper.readTree(jsonResult);
            String codemsg = jsonNode.has("codemsg") ? jsonNode.get("codemsg").asText() : "";

            // Si el login es exitoso con la contraseña candidata, entonces es igual a la actual
            return "USRCCT".equals(codemsg);
        } catch (Exception e) {
            log.warn("Error verificando contraseña legacy: {}", e.getMessage());
            return false; // Ante error, asumimos que no coincide para no bloquear
        }
    }

    /**
     * Detecta si una cadena parece ser un hash BCrypt
     */
    private boolean isBCrypt(String hash) {
        return hash != null && (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$"));
    }
    
    /**
     * Helper para construir respuestas de error
     */
    private Map<String, Object> buildErrorResponse(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("message", message);
        error.put("code", "");
        error.put("request_id", null);
        return error;
    }

    /**
     * Valida un token JWT.
     * 
     * @param token Token JWT a validar
     * @return Map con resultado de validación
     */
    public Map<String, Object> validateToken(String token) {
        Map<String, Object> response = new HashMap<>();

        if (jwtService.validateToken(token) && !jwtService.isTokenExpired(token)) {
            response.put("valid", true);
            response.put("userId", jwtService.extractUserId(token).toString());
            response.put("email", jwtService.extractEmail(token));
            response.put("username", jwtService.extractUsername(token));
        } else {
            response.put("valid", false);
        }

        return response;
    }

    /**
     * Refresca un token JWT.
     * 
     * @param refreshToken Token de refresco
     * @return Map con nuevo access token
     */
    public Map<String, Object> refreshAccessToken(String refreshToken) {
        Map<String, Object> response = new HashMap<>();

        try {
            if (jwtService.validateToken(refreshToken) && !jwtService.isTokenExpired(refreshToken)) {
                UUID userId = jwtService.extractUserId(refreshToken);
                UUID sessionId = jwtService.extractSessionId(refreshToken);
                String email = jwtService.extractEmail(refreshToken);
                String username = jwtService.extractUsername(refreshToken);

                String newAccessToken = jwtService.generateToken(userId, email, username, sessionId);

                response.put("success", true);
                response.put("token", newAccessToken);
            } else {
                response.put("success", false);
                response.put("message", "Invalid or expired refresh token");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error refreshing token");
        }

        return response;
    }

    /**
     * Obtiene información sobre una solicitud de recuperación.
     * 
     * @param requestId ID de la solicitud
     * @return Map con información (email)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getRecoveryRequestInfo(String requestId) {
        Map<String, Object> response = new HashMap<>();
        try {
            UUID id = UUID.fromString(requestId);

            String sql = "SELECT u.email FROM pl_request_recv_pass r " +
                    "JOIN pl_user u ON r.id_user = u.id_user " +
                    "WHERE r.id_request = :requestId";

            String email = (String) entityManager.createNativeQuery(sql)
                    .setParameter("requestId", id)
                    .getSingleResult();

            response.put("email", email);
            response.put("success", true);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Solicitud no encontrada o inválida");
        }
        return response;
    }
}
