package com.uteq.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class RecaptchaService {
    
    @Value("${recaptcha.secret.key}")
    private String secretKey;
    
    @Value("${recaptcha.verify.url}")
    private String verifyUrl;
    
    public boolean verifyRecaptcha(String token) {
        RestTemplate restTemplate = new RestTemplate();
        
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("secret", secretKey);
        params.add("response", token);
        
        try {
            Map<String, Object> response = restTemplate.postForObject(
                verifyUrl, 
                params, 
                Map.class
            );
            
            if (response != null && response.containsKey("success")) {
                return (Boolean) response.get("success");
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }
}
