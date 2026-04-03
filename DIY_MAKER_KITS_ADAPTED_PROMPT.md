# DIY Maker Kits Marketplace — Adapted Implementation Prompt (Current Project)

This document adapts your backend-first microservices prompt to the **current `maker-platform` codebase** and deployment choices.

## 1) Scope and architecture baseline (as-built)

Current implemented baseline:

- Frontend: React + Vite (home app)
- API Gateway: nginx (kept for graded demo)
- Services: User, Product/Catalog, Order, Payment, Forum
- Data: PostgreSQL per service DB + Redis cache for catalog customization
- Containers: Docker Compose local stack
- K8s manifests present under `k8s/`

Architecture flow:

`frontend -> nginx gateway -> service APIs -> PostgreSQL/Redis`

## 2) Backend-first acceptance criteria (adapted)

The project is accepted when all of the following are true:

1. **Customization determinism**
   - `POST /api/v1/customize` returns deterministic BOM, price, and compatibility warnings for the same input.
2. **Checkout safety**
   - Order creation is idempotent-capable, and payment marks order state safely (`PENDING -> PAID`) without duplicate side effects.
3. **Service isolation**
   - Each service has independent schema ownership (database-per-service in this stack).
4. **Gateway controls**
   - All client API traffic goes through nginx gateway.
5. **Forum optional path**
   - CRUD posts endpoint works and does not block checkout flow if unavailable.
6. **Swagger visibility**
   - API docs are available on separate frontend page (`/swagger.html`) and not embedded in the ecommerce home page.

## 3) OS/AOS constraints to enforce in this project

For grading evidence, enforce and demonstrate:

- Container isolation and resource controls (`requests/limits` in Kubernetes manifests).
- Readiness/liveness probes for restart and traffic gating.
- HPA on hot path service (`product-service` already defined in `k8s/deployments.yaml`).
- Failure isolation experiment (kill forum pod -> core commerce remains usable).
- IPC observability path (gateway -> product -> order -> payment) with trace/correlation IDs.

## 4) Immediate gaps from your full research prompt

These are not fully implemented yet and should be next:

1. **OpenTelemetry instrumentation + collector pipeline**
2. **Rate limiting middleware at gateway**
3. **Stronger idempotency key persistence for writes**
4. **Saga + compensating actions with outbox/events**
5. **K8s NetworkPolicies and stricter secret handling**
6. **CI/CD pipeline (build, test, image publish, staged deploy)**
7. **Terraform IaC for repeatable infra provisioning**

## 5) Execution plan for this codebase (priority order)

### Phase A — Stability and correctness

- Add idempotency key table + middleware for order/payment writes.
- Harden order state transitions and payment error handling.
- Add transactional inventory reservation semantics in Product/Order path.

### Phase B — Observability and security

- Add OpenTelemetry SDK in all FastAPI services.
- Add gateway request ID propagation and log correlation.
- Add basic gateway rate limiting and JWT policy tests.

### Phase C — K8s hardening

- Add resource requests/limits for all workloads (verify in manifests).
- Add liveness probes where missing and validate restart behavior.
- Run load test to trigger product-service HPA and capture evidence.

### Phase D — Delivery pipeline

- GitHub Actions: lint/test/build images.
- Deploy staging namespace automatically on merge.
- Add runbook and fault-injection demo script.

## 6) Verification checklist (demo-ready)

- [ ] `docker-compose up --build` starts all services cleanly
- [ ] `http://localhost:8080/health` returns gateway health
- [ ] Ecommerce home works at `http://localhost:5173`
- [ ] Separate Swagger page works at `http://localhost:5173/swagger.html`
- [ ] Register -> customize -> order -> pay flow completes
- [ ] Forum create/list/delete works with auth
- [ ] K8s manifests apply successfully in `maker-platform` namespace

---

This adapted prompt intentionally preserves your research-grade goals while staying aligned with the current nginx + FastAPI implementation and the existing project directory structure.
