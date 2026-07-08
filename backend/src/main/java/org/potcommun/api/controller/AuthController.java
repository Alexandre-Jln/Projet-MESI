package org.potcommun.api.controller;

import jakarta.validation.Valid;
import org.potcommun.api.dto.LoginRequest;
import org.potcommun.api.dto.RegisterRequest;
import org.potcommun.api.dto.UpdateProfileRequest;
import org.potcommun.api.dto.UserResponse;
import org.potcommun.domain.service.EmailVerificationService;
import org.potcommun.domain.service.RecaptchaService;
import org.potcommun.domain.service.UserService;
import org.potcommun.infrastructure.mapper.UserMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Architecture develop : AuthController délègue la conversion DTO ↔ Entity à UserMapper.
 * UserService ne manipule plus que des primitives.
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService service;
    private final UserMapper  mapper;
    private final RecaptchaService recaptchaService;
    private final EmailVerificationService emailVerificationService;

    public AuthController(UserService service, UserMapper mapper,
                          RecaptchaService recaptchaService,
                          EmailVerificationService emailVerificationService) {
        this.service = service;
        this.mapper  = mapper;
        this.recaptchaService = recaptchaService;
        this.emailVerificationService = emailVerificationService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (!recaptchaService.verify(request.captchaToken())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Captcha invalide."));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(
                mapper.toResponse(service.register(request.email(), request.password()))
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        if (!recaptchaService.verify(request.captchaToken())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Captcha invalide."));
        }
        return ResponseEntity.ok(
                mapper.toResponse(service.login(request.email(), request.password()))
        );
    }

    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        emailVerificationService.verifyToken(token);
        return ResponseEntity.ok(Map.of("message", "Email vérifié avec succès."));
    }

    @PutMapping("/profil/{id}")
    public UserResponse updateProfil(@PathVariable Long id, @Valid @RequestBody UpdateProfileRequest request) {
        return mapper.toResponse(
                service.updateProfile(id, request.email(), request.password())
        );
    }
}
