package com.uteq.api.service;

public interface EmailProvider {
    void sendEmail(String to, String subject, String htmlContent) throws Exception;
    String getProviderName();
}
