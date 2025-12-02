package com.uteq.api.service;

import com.uteq.api.entity.TemplateEmail;
import com.uteq.api.repository.TemplateEmailRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class EmailService {

        private final JavaMailSender mailSender;
        private final TemplateEmailRepository templateEmailRepository;

        @org.springframework.beans.factory.annotation.Value("${app.frontend.verify-code-url}")
        private String verifyCodeUrl;

        @org.springframework.beans.factory.annotation.Value("${app.frontend.reset-password-url}")
        private String resetPasswordUrl;

        public void sendWelcomeEmail(String to, String fullName) throws MessagingException {
                TemplateEmail template = templateEmailRepository.findByTypeTempl("WELCM")
                                .orElseThrow(() -> new RuntimeException("Template not found"));

                String content = template.getTemplateEmail()
                                .replace("{{FULL_NAME}}", fullName);

                sendHtmlEmail(to, "Bienvenido a UTEQ Platform", content);
        }

        public void sendRecoveryCodeEmail(String to, String code, String requestId) throws MessagingException {
                TemplateEmail template = templateEmailRepository.findByTypeTempl("RECVP")
                                .orElseThrow(() -> new RuntimeException("Template not found"));

                String verificationLink = verifyCodeUrl + "?requestId=" + requestId;

                String content = template.getTemplateEmail()
                                .replace("CODE_RECOVERY", code)
                                .replace("CODE_GEN_ID", requestId)
                                .replace("{{VERIFY_URL}}", verificationLink);

                sendHtmlEmail(to, "Recuperación de contraseña - Código de verificación", content);
        }

        public void sendCodeVerifiedEmail(String to, String requestId) throws MessagingException {
                TemplateEmail template = templateEmailRepository.findByTypeTempl("RCPS2")
                                .orElseThrow(() -> new RuntimeException("Template not found"));

                String resetLink = resetPasswordUrl + "?requestId=" + requestId;

                String content = template.getTemplateEmail()
                                .replace("CODE_GEN_ID", requestId)
                                .replace("{{RESET_URL}}", resetLink);

                sendHtmlEmail(to, "Recuperación de contraseña - Código verificado", content);
        }

        public void sendPasswordUpdatedEmail(String to) throws MessagingException {
                TemplateEmail template = templateEmailRepository.findByTypeTempl("RCPS3")
                                .orElseThrow(() -> new RuntimeException("Template not found"));

                sendHtmlEmail(to, "Contraseña actualizada exitosamente", template.getTemplateEmail());
        }

        public void sendLoginNotificationEmail(String to, String username) throws MessagingException {
                TemplateEmail template = templateEmailRepository.findByTypeTempl("LOGIN")
                                .orElseThrow(() -> new RuntimeException("Template not found"));

                OffsetDateTime now = OffsetDateTime.now();
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
                String formattedDate = now.format(formatter);

                String content = template.getTemplateEmail()
                                .replace("FECHA_HORA_LOGIN", formattedDate);

                sendHtmlEmail(to, "Inicio de sesión exitoso", content);
        }

        private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setTo(to);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);
                helper.setFrom("uteq-project@gmail.com");

                mailSender.send(message);
        }
}
