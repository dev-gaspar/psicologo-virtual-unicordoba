package com.uteq.api.service.impl;

import com.uteq.api.service.EmailProvider;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "mail.provider", havingValue = "GMAIL")
@RequiredArgsConstructor
public class GmailEmailProvider implements EmailProvider {

    private final JavaMailSender mailSender;

    @Override
    public void sendEmail(String to, String subject, String htmlContent) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        
        mailSender.send(message);
    }

    @Override
    public String getProviderName() {
        return "Gmail";
    }
}
