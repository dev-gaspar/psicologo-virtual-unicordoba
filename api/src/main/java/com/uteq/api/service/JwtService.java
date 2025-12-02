package com.uteq.api.service;

import com.uteq.api.config.JwtConfig;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Servicio para manejo de JSON Web Tokens (JWT).
 * Proporciona funcionalidad para generar, validar y extraer información de
 * tokens JWT.
 */
@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtConfig jwtConfig;

    /**
     * Genera la clave secreta para firmar los JWT.
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtConfig.getSecret().getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Genera un JWT para un usuario autenticado.
     * 
     * @param userId    ID del usuario
     * @param email     Email del usuario
     * @param username  Nombre de usuario
     * @param sessionId ID de la sesión
     * @return Token JWT generado
     */
    public String generateToken(UUID userId, String email, String username, UUID sessionId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId.toString());
        claims.put("email", email);
        claims.put("username", username);
        claims.put("sessionId", sessionId.toString());

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtConfig.getExpiration());

        return Jwts.builder()
                .claims(claims)
                .subject(userId.toString())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Genera un token de refresco para extender la sesión.
     * 
     * @param userId    ID del usuario
     * @param sessionId ID de la sesión
     * @return Refresh token generado
     */
    public String generateRefreshToken(UUID userId, UUID sessionId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId.toString());
        claims.put("sessionId", sessionId.toString());
        claims.put("type", "refresh");

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtConfig.getRefreshExpiration());

        return Jwts.builder()
                .claims(claims)
                .subject(userId.toString())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Valida un token JWT.
     * 
     * @param token Token a validar
     * @return true si el token es válido, false en caso contrario
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Extrae el ID de usuario del token.
     * 
     * @param token Token JWT
     * @return ID del usuario
     */
    public UUID extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        return UUID.fromString(claims.get("userId", String.class));
    }

    /**
     * Extrae el email del token.
     * 
     * @param token Token JWT
     * @return Email del usuario
     */
    public String extractEmail(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("email", String.class);
    }

    /**
     * Extrae el username del token.
     * 
     * @param token Token JWT
     * @return Username del usuario
     */
    public String extractUsername(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("username", String.class);
    }

    /**
     * Extrae el ID de sesión del token.
     * 
     * @param token Token JWT
     * @return ID de la sesión
     */
    public UUID extractSessionId(String token) {
        Claims claims = extractAllClaims(token);
        return UUID.fromString(claims.get("sessionId", String.class));
    }

    /**
     * Verifica si el token ha expirado.
     * 
     * @param token Token JWT
     * @return true si el token está expirado
     */
    public boolean isTokenExpired(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    /**
     * Extrae todos los claims del token.
     * 
     * @param token Token JWT
     * @return Claims del token
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
