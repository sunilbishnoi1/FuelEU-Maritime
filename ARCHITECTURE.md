# Architecture Overview

This document provides a detailed explanation of the architectural design of the FuelEU Maritime Compliance Platform.

## Hexagonal Architecture (Ports & Adapters)

The project is built upon the principles of Hexagonal Architecture, also known as Ports and Adapters. This architectural style aims to create a highly decoupled and maintainable system by isolating the core business logic (the "domain" or "application core") from external concerns such as databases, user interfaces, and third-party services.

### Key Principles:
-   **Separation of Concerns**: The application is divided into distinct layers, each with a specific responsibility.
-   **Inversion of Control**: Dependencies flow inwards, meaning the core domain does not depend on external infrastructure. Instead, external components depend on interfaces (ports) defined by the core.
-   **Testability**: The core business logic can be tested in isolation, without needing to set up databases or UI components.
-   **Flexibility**: External technologies (e.g., database type, web framework) can be swapped out with minimal impact on the core.

### Structure

The architecture is primarily divided into three main areas:

1.  **Core (Domain & Application Layers)**:
    *   **Domain**: Contains the pure business rules, entities, value objects, and aggregates. It is the heart of the application and is completely independent of any external technology.
    *   **Application**: Defines the use cases (application services) that orchestrate the domain objects to fulfill specific business operations. It also defines the "ports" (interfaces) that external adapters must implement.

2.  **Adapters**:
    *   **Inbound Adapters**: These are the entry points into the application core. Examples include HTTP APIs (e.g., Express.js controllers) that translate external requests into calls to application services.
    *   **Outbound Adapters**: These implement the ports defined by the application layer to interact with external systems. Examples include database repositories (e.g., PostgreSQL adapter), external service clients, or message queue producers.

3.  **Infrastructure**:
    *   Handles the setup and configuration of external components, such as database connections, server initialization, and dependency injection. It wires up the adapters to the core.

### Dependency Flow

Dependencies always point inwards, towards the core. The core defines the interfaces (ports), and the adapters implement them. This ensures that changes in external technologies do not ripple into the core business logic.

```
+-------------------------------------------------------------------+
|                           External World                          |
|                                                                   |
|  +-----------------+   +-----------------+   +-----------------+  |
|  |   HTTP Client   |   |   Web UI        |   |   CLI Tool      |  |
|  +-----------------+   +-----------------+   +-----------------+  |
|           |                   |                   |               |
|           v                   v                   v               |
|  +-----------------------------------------------------------------+
|  |                         Inbound Adapters                        |
|  |  (e.g., Express.js Controllers, React Components)               |
|  +-----------------------------------------------------------------+
|           |                                                       |
|           v                                                       |
|  +-----------------------------------------------------------------+
|  |                         Application Layer (Use Cases)         |
|  |  (Orchestrates domain objects, defines outbound ports)          |
|  +-----------------------------------------------------------------+
|           |                                                       |
|           v                                                       |
|  +-----------------------------------------------------------------+
|  |                         Domain Layer (Entities, Value Objects)  |
|  |  (Pure business logic, independent of external concerns)        |
|  +-----------------------------------------------------------------+
|           ^                                                       |
|           |                                                       |
|  +-----------------------------------------------------------------+
|  |                         Outbound Adapters                       |
|  |  (e.g., PostgreSQL Repository, External API Client)             |
|  +-----------------------------------------------------------------+
|           ^                                                       |
|           |                                                       |
|  +-----------------+   +-----------------+   +-----------------+  |
|  |   Database      |   |   External API  |   |   Message Queue |  |
|  +-----------------+   +-----------------+   +-----------------+  |
|                                                                   |
+-------------------------------------------------------------------+
```

## Backend Architecture

The backend specifically implements this pattern with:
-   `src/core/domain`: Contains entities like `Route`, `ComplianceBalance`, `Pool`, `BankEntry`.
-   `src/core/application`: Contains services like `BankingService`, `PoolingService`, `ComplianceService`, which define the application's use cases.
-   `src/core/ports`: Defines interfaces for repositories (e.g., `IBankingRepository`) and external services that the application layer needs.
-   `src/adapters/inbound/http`: Express.js routes and controllers that act as inbound adapters.
-   `src/adapters/outbound/postgres`: PostgreSQL implementations of the repository interfaces, acting as outbound adapters.
-   `src/infrastructure/db`: Database connection, migrations, and seeding.
-   `src/infrastructure/server`: Express server setup.

## Frontend Architecture

The frontend also follows a similar hexagonal approach:
-   `src/core/domain`: Frontend-specific domain entities and value objects.
-   `src/core/application`: Use cases for data fetching, state management, and UI logic.
-   `src/core/ports`: Interfaces for API clients and other outbound interactions.
-   `src/adapters/infrastructure/api-client`: Implementation of the API client port to interact with the backend.
-   `src/adapters/ui`: React components, pages, and UI-specific logic that act as inbound adapters, translating user interactions into application calls.

This consistent architectural approach across both frontend and backend ensures a scalable, maintainable, and robust application.
