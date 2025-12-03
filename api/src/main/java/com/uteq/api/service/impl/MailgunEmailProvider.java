package com.uteq.api.service.impl;

import com.uteq.api.service.EmailProvider;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@ConditionalOnProperty(name = "mail.provider", havingValue = "MAILGUN")
public class MailgunEmailProvider implements EmailProvider {

    @Value("${mailgun.api.key}")
    private String apiKey;

    @Value("${mailgun.domain}")
    private String domain;

    @Value("${mailgun.from.email}")
    private String fromEmail;

    @Value("${mailgun.from.name:Psicólogo Virtual}")
    private String fromName;

    private final OkHttpClient client;

    public MailgunEmailProvider() {
        this.client = new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .build();
    }

    @Override
    public void sendEmail(String to, String subject, String htmlContent) throws Exception {
        String url = String.format("https://api.mailgun.net/v3/%s/messages", domain);
        
        RequestBody formBody = new MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart("from", String.format("%s <%s>", fromName, fromEmail))
                .addFormDataPart("to", to)
                .addFormDataPart("subject", subject)
                .addFormDataPart("html", htmlContent)
                .build();

        Request request = new Request.Builder()
                .url(url)
                .header("Authorization", Credentials.basic("api", apiKey))
                .post(formBody)
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new RuntimeException("Mailgun API error: " + response.code() + " - " + response.body().string());
            }
        }
    }

    @Override
    public String getProviderName() {
        return "Mailgun";
    }
}
