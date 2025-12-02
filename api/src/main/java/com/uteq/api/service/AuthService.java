package com.uteq.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.StoredProcedureQuery;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final EntityManager entityManager;
    private final ObjectMapper objectMapper;
    
    @Transactional
    public Map<String, Object> login(String username, String password) {
        String sql = "SELECT CAST(us_check_information_user_for_login(:in_username, :in_password) AS TEXT)";
        String jsonResult = (String) entityManager.createNativeQuery(sql)
                .setParameter("in_username", username)
                .setParameter("in_password", password)
                .getSingleResult();
        
        try {
            JsonNode jsonNode = objectMapper.readTree(jsonResult);
            Map<String, Object> result = new HashMap<>();
            result.put("codemsg", jsonNode.get("codemsg").asText());
            
            if (jsonNode.has("datauser") && !jsonNode.get("datauser").isNull()) {
                result.put("datauser", objectMapper.convertValue(jsonNode.get("datauser"), Map.class));
            }
            
            return result;
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("codemsg", "ERRORE");
            error.put("datauser", null);
            return error;
        }
    }
    
    @Transactional
    public String register(String fullName, String email, String username, String password, Integer idCountry) {
        try {
            String sql = "SELECT us_register_new_user_data(:us_full_name, :us_email, :us_username, :us_password, :us_id_country)";
            return (String) entityManager.createNativeQuery(sql)
                    .setParameter("us_full_name", fullName)
                    .setParameter("us_email", email)
                    .setParameter("us_username", username)
                    .setParameter("us_password", password)
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
        String sql = "SELECT CAST(us_update_password_step_3(:code_req, :passwordus) AS TEXT)";
        String jsonResult = (String) entityManager.createNativeQuery(sql)
                .setParameter("code_req", codeReq)
                .setParameter("passwordus", password)
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
}
