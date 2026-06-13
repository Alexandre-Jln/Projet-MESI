package org.potcommun.api.controller;

import jakarta.validation.Valid;
import org.potcommun.api.dto.LoginRequest;
import org.potcommun.api.dto.RegisterRequest;
import org.potcommun.api.dto.UserResponse;
import org.potcommun.domain.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService service;

    public AuthController(UserService service) {
        this.service = service;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    // @Valid déclenche la validation Bean Validation avant que la méthode s'exécute.
    // Si un champ est invalide, Spring lève une MethodArgumentNotValidException
    // interceptée par GlobalExceptionHandler → réponse 400 propre.
    public UserResponse register(@Valid @RequestBody RegisterRequest request) {
        return service.register(request);
    }

    @PostMapping("/login")
    public UserResponse login(@Valid @RequestBody LoginRequest request) {
        return service.login(request);
    }
}