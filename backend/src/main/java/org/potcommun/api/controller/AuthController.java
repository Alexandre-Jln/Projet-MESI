package org.potcommun.api.controller;

import jakarta.validation.Valid;
import org.potcommun.api.dto.LoginRequest;
import org.potcommun.api.dto.RegisterRequest;
import org.potcommun.api.dto.UserResponse;
import org.potcommun.domain.service.UserService;
import org.potcommun.infrastructure.mapper.UserMapper;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * Architecture develop : AuthController délègue la conversion DTO ↔ Entity à UserMapper.
 * UserService ne manipule plus que des primitives.
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService service;
    private final UserMapper  mapper;

    public AuthController(UserService service, UserMapper mapper) {
        this.service = service;
        this.mapper  = mapper;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@Valid @RequestBody RegisterRequest request) {
        return mapper.toResponse(
                service.register(request.email(), request.password())
        );
    }

    @PostMapping("/login")
    public UserResponse login(@Valid @RequestBody LoginRequest request) {
        return mapper.toResponse(
                service.login(request.email(), request.password())
        );
    }
}
