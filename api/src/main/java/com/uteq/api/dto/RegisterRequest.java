package com.uteq.api.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String fullName;
    private String email;
    private String username;
    private String password;
    private Integer idCountry;
    private String recaptchaToken;
}
