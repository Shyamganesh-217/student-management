package com.studentauth.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;

/**
 * Utility component for generating, signing, and validating JSON Web Tokens (JWT).
 */
@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long expirationMs;

    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms:86400000}") long expirationMs) {
        this.key = deriveSecretKey(secret);
        this.expirationMs = expirationMs;
    }

    /**
     * Ensures the HMAC secret key is always securely 256-bit compliant.
     */
    private SecretKey deriveSecretKey(String rawSecret) {
        try {
            byte[] rawBytes = rawSecret.getBytes(StandardCharsets.UTF_8);
            if (rawBytes.length < 32) {
                // Hash with SHA-256 to produce exactly 256 bits
                MessageDigest md = MessageDigest.getInstance("SHA-256");
                rawBytes = md.digest(rawBytes);
            }
            return Keys.hmacShaKeyFor(rawBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    /**
     * Generates a signed JWT for the authenticated user.
     */
    public String generateToken(Long id, String name, String email, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(email)
                .claim("id", id)
                .claim("name", name)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    /**
     * Extracts email (subject) from token.
     */
    public String getEmailFromToken(String token) {
        Claims claims = getClaims(token);
        return claims.getSubject();
    }

    /**
     * Extracts role from token.
     */
    public String getRoleFromToken(String token) {
        Claims claims = getClaims(token);
        return claims.get("role", String.class);
    }

    /**
     * Extracts user ID from token.
     */
    public Long getIdFromToken(String token) {
        Claims claims = getClaims(token);
        Number id = claims.get("id", Number.class);
        return id != null ? id.longValue() : null;
    }

    /**
     * Validates JWT signature and expiration.
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            // ExpiredJwtException, UnsupportedJwtException, MalformedJwtException, SignatureException
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
