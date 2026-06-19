package org.potcommun.domain.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class StripeService {

    @Value("${stripe.secret.key}")
    private String secretKey;

    /**
     * Crée un PaymentIntent Stripe et retourne son client_secret.
     * Le frontend utilise ce secret pour afficher le formulaire de paiement
     * et confirmer la transaction côté client avec Stripe.js.
     *
     * @param montantEuros montant en euros (ex: 15.50)
     * @param cagnotteId   identifiant de la cagnotte (stocké en métadonnée)
     * @return client_secret à envoyer au frontend
     */
    public String creerPaymentIntent(BigDecimal montantEuros, Long cagnotteId) {
        Stripe.apiKey = secretKey;

        // Stripe travaille en centimes (entier) : 15.50 € → 1550
        long montantCentimes = montantEuros
                .multiply(BigDecimal.valueOf(100))
                .longValue();

        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(montantCentimes)
                    .setCurrency("eur")
                    .putMetadata("cagnotte_id", String.valueOf(cagnotteId))
                    // Automatic payment methods : Stripe active automatiquement
                    // les méthodes disponibles dans ton Dashboard (carte, etc.)
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);
            return intent.getClientSecret();

        } catch (StripeException e) {
            throw new RuntimeException("Erreur Stripe lors de la création du paiement : " + e.getMessage(), e);
        }
    }
}
