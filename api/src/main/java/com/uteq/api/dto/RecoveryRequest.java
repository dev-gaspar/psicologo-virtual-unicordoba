package com.uteq.api.dto;

import lombok.Data;

@Data
public class RecoveryRequest {
    private String email;
    private String recaptchaToken;
}
