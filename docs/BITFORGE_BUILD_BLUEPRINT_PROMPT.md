# BitForge Build Blueprint Prompt for Cursor

## Project intent and success bar

BitForge is a microservices-first DIY electronics marketplace (User, Product, Order, Payment) behind an API Gateway, deployed via containers and orchestrated for self-healing and scaling—explicitly to demonstrate Advanced Operating Systems concepts through a realistic e-commerce workflow.

The deliverable quality bar should resemble a “small production system”: clear service boundaries, independent deployability, strong correctness under concurrency, measured resilience under faults, and observable behavior under load. Kubernetes autoscaling and health probes provide demonstrable, OS-adjacent mechanisms for resource management and failure recovery in a modern distributed stack.

## Liquid Glass research and web adaptation guidance

Apple’s Liquid Glass design direction emphasizes glass-like translucency that adapts to context (light/dark), with dynamic highlights and a “UI fades back, content comes forward” philosophy.

The Liquid Glass overview and adoption guidance frames this as a visual refresh across materials, controls, and icons, and notes that adoption is meant to be incremental rather than a total rewrite.

Practical implementation notes from Apple’s own developer video transcript are especially relevant to a high-performance web adaptation: much of the effect is “out of the box,” but you should avoid nesting glass layers (double translucency/blur looks wrong), apply the effect where it matters (top-level navigation and key controls), and be mindful of performance because the effect can be GPU intensive—especially in scrollable or frequently updated views.

For a web frontend, emulate Liquid Glass with a small set of reusable “glass primitives” (cards, nav bars, buttons) built on `backdrop-filter: blur(...)`, thin borders, low-alpha fills, specular highlight overlays, and careful contrast/legibility rules—plus a user-facing “Reduce Transparency” toggle to protect readability and frame rate, mirroring the performance cautions above.

## Backend architecture and advanced OS concepts mapping

A microservices architecture can be used to explicitly demonstrate OS fundamentals:

- Containers represent isolated processes with constrained resources, mapping to isolation and resource governance via kernel primitives (namespaces/cgroups) and runtime controls.
- FastAPI’s concurrency model (mixing `def` and `async def` appropriately) provides a direct way to discuss concurrency vs parallelism, event loops, and safe cancellation points (`await`).
- PostgreSQL transactions and isolation levels support rigorous discussion of concurrency correctness (race conditions, oversell protection, idempotency, and transactional boundaries).
- Kubernetes liveness/readiness probes and self-healing behavior demonstrate automated fault recovery and “desired state” control loops—mirroring OS supervision concepts at cluster scale.
- Autoscaling with Horizontal Pod Autoscaler concretely shows dynamic resource allocation under load and decoupled scaling of hot components.
- An API Gateway with rate limiting and route selection policies demonstrates controlled admission, load shaping, and consistent cross-cutting enforcement at the edge.

## Repository blueprint and documentation expectations

A top-tier deliverable should be structured so each service is independently testable and deployable, but easy to run as a whole system locally. Documentation should not be “a single README”; it should include architecture rationale, API contracts, operational runbooks, and a demo script that explicitly maps observed behaviors to OS concepts.

In particular, docs should clearly show:

- service boundaries and data ownership
- fault model (crash failures + unreliable networks) and practical mitigations (timeouts, retries, probes)
- concurrency risks and specific strategy used to prevent oversell/duplicate processing
- a repeatable load + scale demonstration (baseline vs scaled) with captured metrics/traces
- Kubernetes probes and HPA in operator language (what they do, what to check, what success looks like)

## Reliability, scaling, and observability requirements

- Health checks: readiness gates traffic and liveness triggers restart when needed.
- Gateway resilience: rate limit by route/service/consumer; propagate request IDs for correlation.
- Autoscaling: prove scaling only `product-service` improves browsing responsiveness.
- Observability: instrument gateway + services; show end-to-end checkout trace and before/after scaling metrics.

## 1000-word build prompt (verbatim source prompt)

You are an expert full-stack systems engineer building a course-grade, production-style deliverable called BitForge: a microservices-based DIY electronics marketplace. Prioritize backend microservices and Advanced Operating Systems concepts (process isolation, concurrency, scheduling, networking, crash failure, observability). The frontend must be minimal but premium: emulate Apple “Liquid Glass” look-and-feel with ultra-realistic glass materials, dynamic highlights, and smooth motion; keep the glass effect focused on top-level navigation and key controls for performance.

Deliver a monorepo with complete project structure, runnable locally (Docker Compose) and deployable to Kubernetes. Implement four core microservices: user-service, product-service, order-service, payment-service. All external traffic flows through an API Gateway. Each service owns its data (separate Postgres schema or DB), uses transactions for correctness, and exposes REST APIs with OpenAPI docs. Use Redis for caching and as a backing store for rate limiting / sessions if needed.

Hard requirements (must implement):
1) API Gateway: Nginx or Kong configuration with routing, JWT validation (or delegating to user-service), request ID propagation, CORS, and rate limiting. Include example policies and per-route limits.
2) Microservices: Python FastAPI (preferred). Each service runs as its own containerized process; within each service use async endpoints where appropriate; use a DB connection pool; validate with Pydantic; include structured logging (JSON).
3) Distributed workflow: implement the checkout flow as a saga:
   - Order created in PENDING_PAYMENT
   - Payment authorized/confirmed
   - Order transitions to CONFIRMED (or FAILED)
   Use idempotency keys and request IDs so retries are safe. Implement an Outbox pattern inside order-service (table + worker) OR a lightweight message broker (NATS/RabbitMQ) for async events; choose one and document why.
4) Fault tolerance: timeouts, retries with exponential backoff, and circuit-breaker behavior on inter-service calls. Add health endpoints and Kubernetes liveness/readiness probes for each service. Demonstrate crash-failure isolation (killing payment-service doesn’t break browsing).
5) Scalability: provide Kubernetes manifests with Deployments and Services; configure Horizontal Pod Autoscaler for product-service and/or gateway; include resource requests/limits (CPU/memory).
6) Observability: OpenTelemetry instrumentation for gateway + services, exporting traces to Jaeger (docker-compose) and metrics to Prometheus; add a Grafana dashboard JSON; include correlation IDs end-to-end.
7) Security: JWT auth with access/refresh tokens; password hashing; role-based access for admin endpoints; store secrets via env vars locally and Kubernetes Secrets in k8s.
8) Data correctness: prevent oversell/race conditions for stock. Use one of: SELECT … FOR UPDATE, optimistic locking with version column, or SERIALIZABLE transaction for the critical section. Document the choice.

Frontend requirements (minimal but high-end):
- React + Vite + TypeScript.
- Implement pages: Login/Register, Product Catalog (Base Kits + Modules), Product Detail, Cart, Checkout, Orders.
- “Liquid Glass” theme system: create reusable components (GlassSurface, GlassCard, GlassButton, GlassNavBar) using translucent layers, blur (backdrop-filter), subtle borders, specular highlight overlays, and adaptive light/dark modes. Include a “Reduce Transparency” toggle for accessibility and performance.
- Keep glass effects off large scrolling lists; use solid/blur-lite variants for list items to maintain frame rate.
- All calls go through the API Gateway; use typed API client; show errors gracefully with retry UI.

Assets & seeding:
- Create an /assets directory containing the provided “Base kits” and “Modules” images.
- Build a seed script in product-service that imports these images, creates categories (Base Kits, Modules), and seeds ~20 products with realistic fields: sku, name, description, price, stock, tags, image path, compatibility notes, and “build difficulty”.
- Provide a script to regenerate seed data deterministically.

Repo layout (must match exactly, adjust only if necessary and document):
/bitforge
  /apps
    /frontend-web
    /gateway
  /services
    /user-service
    /product-service
    /order-service
    /payment-service
  /packages
    /shared
      /contracts (OpenAPI specs + JSON Schemas)
      /py (shared python utilities: logging, config, tracing)
      /ts (shared TypeScript API client types)
  /infra
    /docker-compose
    /k8s
    /helm (optional)
  /docs
    architecture.md
    api.md
    deployments.md
    fault-injection-demo.md
    observability.md
    adr/
  /scripts
    dev.sh
    lint.sh
    test.sh
    loadtest/
  README.md

Implementation details by service:
- user-service: register/login/refresh/logout; profile; admin role; token issuance; Redis optional for session revoke list; endpoints under /v1/users.
- product-service: catalog, search, filters, categories, stock, images; caching hot endpoints in Redis; endpoints under /v1/products.
- order-service: cart->order creation, order history, order status transitions, outbox worker; endpoints /v1/orders.
- payment-service: simulate payment provider; idempotent charge endpoint; webhook simulation back to order-service; endpoints /v1/payments.

CI quality bar:
- Pre-commit formatting (black/ruff for Python, eslint/prettier for TS).
- Unit tests per service + contract tests (OpenAPI) + minimal E2E (happy path).
- GitHub Actions pipeline: lint, test, build images, run compose integration tests, produce artifacts.

Nonfunctional and OS-focused requirements:
- Graceful shutdown: handle SIGTERM/SIGINT, finish in-flight requests, flush logs, and close DB connections cleanly; document Kubernetes termination.
- Networking realism: explicit connect/read timeouts; retries only when safe; include a simple network delay/timeout demo mode.
- Data migration discipline: Alembic migrations only; provide `make migrate` per service.
- API design: version all APIs (`/v1`), return a consistent error envelope, and document status codes.
- Load testing: include k6 (or Locust) scripts for product browsing and checkout; document expected p95 latency change and HPA behavior.

Acceptance criteria:
1) `docker compose up` runs gateway, all services, Postgres, Redis, Jaeger, Prometheus, Grafana, and frontend.
2) Seed data loads (Base Kits & Modules) with images; catalog and checkout work end-to-end.
3) Fault demo: stopping payment-service keeps browsing working and leaves orders in a safe state.
4) Scale demo: product-service scales via HPA under load; traces show gateway→order→payment→order.

Now produce:
A) complete file tree with key files listed,
B) code skeletons for each service/frontend (representative endpoints fully implemented),
C) docker-compose + k8s manifests,
D) seed scripts + sample data,
E) docs with run instructions + troubleshooting,
F) checklist mapping features to AOS concepts (processes/threads, scheduling, isolation, sockets, failure recovery).

