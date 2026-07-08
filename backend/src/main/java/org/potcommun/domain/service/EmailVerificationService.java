package org.potcommun.domain.service;

import org.potcommun.domain.exception.InvalidTokenException;
import org.potcommun.infrastructure.persistence.EmailVerificationToken;
import org.potcommun.infrastructure.persistence.EmailVerificationTokenRepository;
import org.potcommun.infrastructure.persistence.UserEntity;
import org.potcommun.infrastructure.persistence.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class EmailVerificationService {

    private final EmailVerificationTokenRepository tokenRepo;
    private final UserRepository userRepo;
    private final JavaMailSender mailSender;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String fromAddress;

    public EmailVerificationService(EmailVerificationTokenRepository tokenRepo,
                                    UserRepository userRepo,
                                    JavaMailSender mailSender) {
        this.tokenRepo = tokenRepo;
        this.userRepo = userRepo;
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(UserEntity user, String rawEmail) {
        String token = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(24);

        EmailVerificationToken verificationToken =
                new EmailVerificationToken(token, user, expiresAt);
        tokenRepo.save(verificationToken);

        String link = frontendUrl + "/verify-email?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(rawEmail);
        message.setSubject("PotCommun — Vérifiez votre adresse email");
        message.setText(
                "Bonjour,\n\n" +
                        "Merci de vous être inscrit sur PotCommun.\n" +
                        "Cliquez sur le lien ci-dessous pour valider votre compte (valide 24h) :\n\n" +
                        link + "\n\n" +
                        "Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email."
        );

        mailSender.send(message);
    }

    public void verifyToken(String token) {
        EmailVerificationToken verificationToken = tokenRepo.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Token invalide."));

        if (verificationToken.isExpired()) {
            throw new InvalidTokenException("Ce lien de vérification a expiré.");
        }

        UserEntity user = verificationToken.getUser();
        user.setEmailVerified(true);
        userRepo.save(user);

        tokenRepo.delete(verificationToken);
    }
}
