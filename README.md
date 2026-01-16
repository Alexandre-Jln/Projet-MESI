backend/
│
├── src/
│   ├── main/
│   │   ├── java/com/yourapp/
│   │   │   ├── api/               → REST controllers (exposition)
│   │   │   │   ├── dto/           → DTO d’entrée/sortie
│   │   │   │   └── mapper/        → MapStruct ou mappers manuels
│   │   │   │
│   │   │   ├── domain/            → Logique métier pure
│   │   │   │   ├── model/         → Entités métier (pas JPA)
│   │   │   │   ├── service/       → Services métier
│   │   │   │   └── exception/     → Exceptions métier
│   │   │   │
│   │   │   ├── infrastructure/    → Tout ce qui touche l’extérieur
│   │   │   │   ├── persistence/   → Repositories JPA, entités JPA
│   │   │   │   ├── config/        → Config Spring, sécurité, CORS
│   │   │   │   ├── client/        → Clients externes (HTTP, Kafka…)
│   │   │   │   └── mapper/        → Mappers JPA ↔ Domain
│   │   │   │
│   │   │   └── util/              → Helpers, utils, constantes
│   │   │
│   │   └── resources/
│   │       ├── application.yml
│   │       └── db/migration/      → Scripts Flyway ou Liquibase
│   │
│   └── test/
│       ├── unit/                  → Tests unitaires
│       └── integration/           → Tests d’intégration
│
└── pom.xml
