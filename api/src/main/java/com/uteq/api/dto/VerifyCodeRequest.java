package com.uteq.api.dto;

import lombok.Data;

@Data
public class VerifyCodeRequest {
    private String codeReq;
    private String codeGen;
    private String recaptchaToken;
}
