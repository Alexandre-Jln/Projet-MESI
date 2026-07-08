package org.potcommun.domain.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class RecaptchaService {

    @Value("${recaptcha.secret}")
    private String secret;

    private static final String VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

    public boolean verify(String token) {
        if (token == null || token.isBlank()) return false;

        RestTemplate restTemplate = new RestTemplate();

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("secret", secret);
        params.add("response", token);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(VERIFY_URL, params, Map.class);
            Map<String, Object> body = response.getBody();
            return body != null && Boolean.TRUE.equals(body.get("success"));
        } catch (Exception e) {
            return false;
        }
    }
}
