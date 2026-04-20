# BitForge Blueprint Alignment Status (Current Repo)

This file translates `BITFORGE_BUILD_BLUEPRINT_PROMPT.md` into **actionable status** for the current `maker-platform` implementation.

## Scope note

- Current stack is **MERN-oriented** (Node/Express + MongoDB + React/Vite + nginx) with extra services (`cart`, `review`, `forum`).
- Blueprint text includes a **Python/FastAPI + Postgres preferred** variant and an “exact monorepo layout”.
- We treat the blueprint as a **quality target**, and this file records what is done vs pending.

## Status matrix

| Blueprint requirement | Current status | Notes |
|---|---|---|
| Gateway routing + rate limiting | Implemented | nginx routes + `limit_req` zones in `gateway/nginx.conf`. |
| JWT enforcement | Implemented (service-side) | Services verify Bearer JWT; gateway forwards auth header. |
| Request ID propagation | Implemented | Gateway generates/forwards `X-Request-Id`; all services echo header and log request ID in structured JSON. |
| Four core services | Implemented | `user`, `product`, `order`, `payment` present; plus `cart`, `review`, `forum`. |
| Data ownership per service | Implemented | Separate Mongo DB names per service (`UserDB`, `ProductDB`, etc.). |
| Checkout saga + idempotency | Implemented | Order/payment idempotency + compensation path present. |
| Outbox or broker | Partial | Compensation exists; formal outbox table/worker is not standardized across services. |
| Timeouts/retries/backoff | Partial | Implemented mainly in payment service; not yet unified policy across all inter-service clients. |
| Circuit breaker | Implemented | Circuit breaker wrappers now protect order↔product and payment↔order inter-service calls with open/half-open behavior. |
| K8s readiness/liveness + HPA | Implemented | Probes + product-service HPA in `k8s/deployments.yaml`. |
| OTel + Jaeger | Implemented | Collector + Jaeger + service instrumentation in compose. |
| Prometheus + Grafana | Implemented (compose + k8s manifests) | Added Prometheus + Grafana + nginx exporter in compose and mirrored them in `k8s/` manifests with scrape/provisioning configs and dashboard JSON. |
| Correlation IDs end-to-end | Implemented (HTTP path) | Request ID is propagated through gateway and key service-to-service calls; surfaced in response headers/logs. |
| Security: JWT + RBAC + secrets | Implemented (baseline) | JWT + admin roles + env/secret usage present. |
| Access/refresh token split | Missing | Currently single JWT token flow. |
| Oversell/race prevention strategy | Partial | Stock check/decrement exists; formal DB lock/version strategy should be documented and hardened. |
| Frontend pages (login/catalog/detail/cart/checkout/orders) | Implemented | Present in `frontend/src/pages/`. |
| Liquid Glass primitives + reduce-transparency toggle | Missing | Current UI is Bootstrap baseline; add glass design system components next. |
| Typed API client and retry UI | Partial | Axios calls exist; shared typed API client package not centralized yet. |
| Seed data with assets + deterministic reseed | Partial | Product seed exists; expand to blueprint’s richer ~20 SKU target and deterministic script. |
| Repo exact layout from blueprint | Missing | Current layout differs (`frontend`, `gateway`, `microservices`, `k8s` etc.). |
| OpenAPI contracts in shared package | Missing | Need `/packages/shared/contracts` or equivalent generated specs. |
| CI: lint/test/build/integration pipeline | Missing/Partial | Local build works; full GH Actions pipeline and contract/E2E tests pending. |
| Graceful shutdown docs and behavior | Partial | Needs explicit SIGTERM handling docs and verification script. |
| Load tests + HPA evidence (p95) | Missing | Need k6/Locust scripts + benchmark captures. |

## Priority implementation sequence (recommended)

1. **Correctness hardening**: formal oversell strategy documentation + implementation guard (versioning/transactions).
2. **UI polish**: add Liquid Glass primitives and “Reduce Transparency” toggle.
3. **Developer quality bar**: test suites, contract tests, CI pipeline, load tests, demo script.
4. **Structure convergence** (optional): gradually mirror blueprint layout in a non-breaking migration.

## Suggested deliverable narrative for grading

- “We meet the architecture intent (gateway, independent services, caching, orchestration, observability), while choosing MERN migration constraints agreed by the team.”
- “We document deltas from the FastAPI/Postgres preferred variant and provide an explicit completion plan.”
- “AOS mapping is evidenced by probes/HPA/retries/isolation/tracing/fault experiments, not by language choice alone.”

