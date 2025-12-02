package com.uteq.api.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        try {
            Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
            Map<String, Object> envMap = new HashMap<>();
            dotenv.entries().forEach(entry -> envMap.put(entry.getKey(), entry.getValue()));
            
            if (!envMap.isEmpty()) {
                // Add as a property source with high priority (before system properties but after command line args usually)
                // We use addLast to act as defaults if not set in system env, OR addFirst to override?
                // Usually we want .env to provide values for application.properties
                environment.getPropertySources().addLast(new MapPropertySource("dotenvProperties", envMap));
            }
        } catch (Exception e) {
            // Ignore errors
        }
    }
}
