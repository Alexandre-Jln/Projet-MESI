package org.potcommun.api.controller;

import jakarta.validation.Valid;
import org.potcommun.api.dto.LoginRequest;
import org.potcommun.api.dto.RegisterRequest;
import org.potcommun.api.dto.UserResponse;
import org.potcommun.domain.service.EmailVerificationService;
import org.potcommun.domain.service.HCaptchaService;
import org.potcommun.domain.service.UserService;
import org.potcommun.infrastructure.mapper.UserMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService     service;
    private final UserMapper      mapper;
    private final HCaptchaService hCaptchaService;
    private final EmailVerificationService emailVerificationService;

    public AuthController(UserService service,
                          UserMapper mapper,
                          HCaptchaService hCaptchaService,
                          EmailVerificationService emailVerificationService) {
        this.service         = service;
        this.mapper          = mapper;
        this.hCaptchaService = hCaptchaService;
        this.emailVerificationService = emailVerificationService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (!hCaptchaService.verify(request.captchaToken())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Captcha invalide."));
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mapper.toResponse(
                        service.register(request.email(), request.password())
                ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        if (!hCaptchaService.verify(request.captchaToken())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Captcha invalide."));
        }
        return ResponseEntity.ok(mapper.toResponse(
                service.login(request.email(), request.password())
        ));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        emailVerificationService.verifyToken(token);
        return ResponseEntity.ok(Map.of("message", "Email vérifié avec succès."));
    }
}