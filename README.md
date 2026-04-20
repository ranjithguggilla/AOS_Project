# BitForge — DIY Maker Kits Marketplace

**Course context:** This repository is the **AOS (Advanced Operating Systems) project** deliverable for **Project-3 — Kubernetes cluster management**: a demonstrable **microservices** stack with **Docker Compose** for local orchestration, **Kubernetes** manifests under `k8s/`, and **observability** suitable for cluster operations review.

**BitForge** is a full-stack **microservices** platform for a DIY maker kits marketplace built around an original product concept focused on **kits, customization, and maker workflows**, not a generic retail clone. The **center of gravity is the backend**: an **nginx API gateway**, independently deployable Node.js services, **MongoDB** with database per service boundaries, **Redis**, structured **observability** (Prometheus, Grafana, Jaeger), and optional **Kubernetes** / Terraform for deployment so, the system reads as a **demonstrable distributed architecture** with **health checks, metrics, tracing, and gateway controlled ingress** supporting operational safety and reviewability.

**High-level flow:** `React (Vite)` → `nginx :8080` → `microservices` → `MongoDB` / `Redis`

---

## Contents

- [Architecture](#architecture)
- [Repository layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Run locally](#run-locally)
- [Health checks & monitoring](#health-checks--monitoring)
- [Configuration & security](#configuration--security)
- [Testing & CI](#testing--ci)
- [Kubernetes & Terraform](#kubernetes--terraform)
- [Documentation](#documentation)
- [Source repository](#source-repository)

---

## Architecture

| Layer | Implementation |
|--------|------------------|
| **Client** | React 18 + TypeScript, Vite (`frontend/`) |
| **API gateway** | nginx (`gateway/nginx.conf`) — **not** Kong in this branch |
| **Services** | Node.js + Express — see `microservices/*` |
| **Data** | MongoDB 7 — logical **per-service databases** on one instance (`UserDB`, `ProductDB`, …) |
| **Cache** | Redis — hot-path caching (e.g. product list); auth is **JWT** (stateless) |
| **Observability** | OpenTelemetry → collector → **Jaeger**; **Prometheus** scrapes `/metrics`; **Grafana** dashboards |

Additional architecture notes and diagram reconciliation are in [`docs/REFERENCE_RECONCILIATION.md`](docs/REFERENCE_RECONCILIATION.md).

---

## Repository layout

| Path | Purpose |
|------|---------|
| `frontend/` | Vite app, proxies `/api` to gateway port 8080 in dev |
| `gateway/` | nginx configuration for routing, `/health`, `/api/*` |
| `microservices/` | `user`, `product`, `cart`, `order`, `payment`, `review`, `forum` services |
| `infra/` | Prometheus, Grafana, OTel collector configs |
| `k8s/` | Kubernetes deployments, configmaps, HPA-oriented material |
| `infra/terraform/gke/` | GKE baseline (optional cloud deployment) |
| `.github/workflows/` | CI — lint, tests, integration gates |
| `docs/` | Build blueprint, deployment notes, evidence docs |
| `docker-compose.yml` | Full local stack (gateway, services, Mongo, Redis, Jaeger, Prometheus, Grafana) |

---

## Prerequisites

- **Docker Desktop** (or Docker Engine) + **Docker Compose v2**
- **Node.js 18+** and npm (frontend and local tooling)

---

## Run locally

### 1. Backend, gateway, databases, observability

```bash
cd <repository-root>   # folder where this README and docker-compose.yml live
docker compose up --build
```

Leave this running. First start builds images and may take several minutes.

If Compose fails with **“port is already allocated”** (often **6379** or **4317**), stop other stacks (`docker compose down` in other project folders) or run **`docker compose down`** here and retry. Redis is published on host **6380** (not 6379) to reduce clashes; apps inside Docker still use **`redis:6379`**.

### 2. Frontend (separate terminal)

```bash
cd <repository-root>/frontend
npm install
npm run dev
```

Open the URL Vite prints (default **http://localhost:5173**). API calls go to **http://localhost:8080** via the Vite dev proxy (`vite.config.ts`).

### Useful URLs (compose running)

| Endpoint | Purpose |
|----------|---------|
| http://localhost:8080/health | Gateway liveness |
| http://localhost:8080/health/details | Gateway + pointers to upstream checks |
| http://localhost:8080/health/upstream/product | Example: product-service through gateway |
| http://localhost:9090 | Prometheus |
| http://localhost:3000 | Grafana (`admin` / `admin` in compose) |
| http://localhost:16686 | Jaeger UI |

**Direct service ports (debugging):** user `8001`, product `8002`, order `8003`, payment `8004`, forum `8005`, cart `8006`, review `8007`.

### Demo accounts

- **Admin:** `admin@maker.local` / `admin123` (when seeded via user-service)
- Register additional users at `/register`

### Product catalog seeding

Product data is loaded from `microservices/product-service/seed.js` when the product service starts. If you use **Docker’s MongoDB** and also run Mongo on the host, ensure you seed the **same** database the app uses. A helper script exists: `microservices/product-service/scripts/syncSeed.js` (see `npm run seed` in that package). Flush Redis keys for `products:*` after catalog changes if responses look stale.

---

## Health checks & monitoring

- **Gateway:** `GET /health`, `GET /health/ready`, `GET /health/upstream/{user|product|order|payment|cart|review|forum}`
- **Each microservice:** `GET /health` and `GET /metrics` (Prometheus)
- **Prometheus** scrapes all services and nginx metrics (see `infra/prometheus/prometheus.yml`)
- **Grafana** is pre-provisioned with a Prometheus datasource (`infra/grafana/provisioning/`)

Use **Prometheus → Status → Targets** to confirm all jobs are **UP** when diagnosing the stack.

---

## Configuration & security

- Copy patterns from `k8s/secret.example.yaml` for real clusters; **do not** commit live secrets.
- Compose uses `JWT_SECRET` and `SERVICE_TOKEN` defaults suitable **only for local development** — change them for any shared or production environment.
- `.env` files are gitignored; use environment variables or compose overrides for secrets.

---

## Testing & CI

- **Frontend:** Vitest / Testing Library; **E2E:** Playwright (`frontend/e2e/`)
- **Services:** Node’s built-in test runner where configured (`npm test` per service)
- **Integration:** Gateway and checkout flows under `tests/` and CI workflow
- **CI:** `.github/workflows/ci.yml` — install, lint, unit tests, build, integration where enabled

Run locally before pushing:

```bash
# Example: frontend
cd frontend && npm run lint && npm test

# Example: product-service
cd microservices/product-service && npm test
```

---

## Kubernetes & Terraform

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
# Use a real Secret in production — see k8s/secret.example.yaml
kubectl apply -f k8s/deployments.yaml
```

Details: [`k8s/README.md`](k8s/README.md). GKE-oriented notes: [`docs/GKE_DEPLOYMENT.md`](docs/GKE_DEPLOYMENT.md). Terraform: `infra/terraform/gke/` (see `terraform.tfvars.example`).

---

## Documentation

| Document | Description |
|----------|-------------|
| [`docs/REFERENCE_RECONCILIATION.md`](docs/REFERENCE_RECONCILIATION.md) | Line-by-line alignment with course artifacts |
| [`docs/GKE_DEPLOYMENT.md`](docs/GKE_DEPLOYMENT.md) | Cluster deployment notes |
| [`docs/LOAD_HPA_EVIDENCE.md`](docs/LOAD_HPA_EVIDENCE.md) | Load / HPA evidence |
| [`docs/BLUEPRINT_ALIGNMENT_STATUS.md`](docs/BLUEPRINT_ALIGNMENT_STATUS.md) | Feature tracking |

---

## Source repository

Canonical remote: **[github.com/ranjithguggilla/bitforge](https://github.com/ranjithguggilla/bitforge)**

```bash
git clone https://github.com/ranjithguggilla/bitforge.git
cd bitforge
```

---

## Project positioning

BitForge targets **maker kits and hands-on builds**—a different problem space than mass-market e‑commerce (e.g. broad retail catalogs). The implementation is designed to **showcase microservices in depth**: clear service boundaries, gateway-mediated APIs, resilient patterns (caching, idempotency where applicable), **JWT + service-to-service auth**, and **full-stack observability** so behavior under load and failure modes can be inspected—not a thin CRUD demo. That backend emphasis is intentional: it is what distinguishes this platform architecturally from “another online shop” and keeps the demonstration **strong, inspectable, and safety-conscious** for real distributed-systems practice.
