package com.uteq.api.service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final EntityManager entityManager;
    private final ObjectMapper objectMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final com.uteq.api.repository.UserRepository userRepository;
    private final com.uteq.api.repository.ResetPassRepository resetPassRepository;

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
            // Validar que codeReq no sea nulo o vacío
            if (codeReq == null || codeReq.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "CRQNVD");
                error.put("code", "");
                error.put("request_id", null);
                return error;
            }

            // Validar que password no sea nulo o vacío
            if (password == null || password.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "PASNVD");
                error.put("code", "");
                error.put("request_id", null);
                return error;
            }

            UUID requestId = UUID.fromString(codeReq.trim());
            
            // Obtener el registro de reset pass para obtener el usuario
            com.uteq.api.entity.ResetPass resetPass = resetPassRepository.findByIdRequest(requestId).orElse(null);
            
            if (resetPass == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "CRQNEX");
                error.put("code", "");
                error.put("request_id", null);
                return error;
            }

            // Obtener el usuario
            com.uteq.api.entity.User user = resetPass.getUser();
            
            // 1. Verificar contra la contraseña actual del usuario
            if (passwordEncoder.matches(password.trim(), user.getPassword().trim())) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "PSWEQS");
                error.put("code", "");
                error.put("request_id", null);
                return error;
            }

            // 2. Obtener todas las contraseñas antiguas del historial de este usuario
            java.util.List<com.uteq.api.entity.ResetPass> passwordHistory = resetPassRepository.findByUser(user);
            
            // 3. Verificar contra todas las contraseñas antiguas
            for (com.uteq.api.entity.ResetPass historyEntry : passwordHistory) {
                // Verificar old_password
                if (historyEntry.getOldPassword() != null && 
                    !historyEntry.getOldPassword().trim().isEmpty() &&
                    passwordEncoder.matches(password.trim(), historyEntry.getOldPassword().trim())) {
                    Map<String, Object> error = new HashMap<>();
                    error.put("message", "PSWEQS");
                    error.put("code", "");
                    error.put("request_id", null);
                    return error;
                }
                
                // Verificar new_password (contraseñas que se establecieron anteriormente)
                if (historyEntry.getNewPassword() != null && 
                    !historyEntry.getNewPassword().trim().isEmpty() &&
                    passwordEncoder.matches(password.trim(), historyEntry.getNewPassword().trim())) {
                    Map<String, Object> error = new HashMap<>();
                    error.put("message", "PSWEQS");
                    error.put("code", "");
                    error.put("request_id", null);
                    return error;
                }
            }

            // Si pasa todas las validaciones, hashear la nueva contraseña y proceder
            String hashedPassword = passwordEncoder.encode(password.trim());

            String sql = "SELECT CAST(us_update_password_step_3(:code_req, :passwordus) AS TEXT)";
            String jsonResult = (String) entityManager.createNativeQuery(sql)
                    .setParameter("code_req", codeReq)
                    .setParameter("passwordus", hashedPassword)
                    .getSingleResult();

            return objectMapper.readValue(jsonResult, Map.class);
        } catch (IllegalArgumentException e) {
            // Error al parsear UUID
            Map<String, Object> error = new HashMap<>();
            error.put("message", "CRQINV");
            error.put("code", "UUID inválido");
            error.put("request_id", null);
            return error;
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("message", "ERROR");
            error.put("code", e.getMessage());
            error.put("request_id", null);
            return error;
        }
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
