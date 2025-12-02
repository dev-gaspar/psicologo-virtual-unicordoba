package com.uteq.api.dto;

import lombok.Data;

@Data
public class ResetPasswordRequest {
    private String codeReq;
    private String password;
    private String recaptchaToken;
}
