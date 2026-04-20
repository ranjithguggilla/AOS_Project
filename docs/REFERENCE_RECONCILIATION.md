# Reference documents ↔ current `maker-platform` build

This reconciles the copied materials in `docs/` against **what is implemented today** (Node.js microservices, MongoDB per logical DB name, nginx gateway, React+Vite frontend).

## Sources overview

| Document | Main intent | Fit to this repo |
|----------|-------------|------------------|
| **Architecture-AOS.png** | React+Vite → Nginx/Kong gateway → User / Product / Order / Payment → PostgreSQL (4 DBs) + Redis; Docker/K8s images listed. | **Aligned in shape**: same client → gateway → four core services → data layer + Redis → containers. **Differences**: gateway is **nginx only**; persistence is **MongoDB** (still database-per-service); **Cart, Review, Forum** are extra services beyond the four boxes. |
| **BitForge Presentation.pptx** & **BitForge Slides.docx** | DIY marketplace; phases (core services, gateway, Docker, K8s, evaluation); stack lists **PostgreSQL** + Redis; Nginx/Kong. | **Aligned** on microservices boundaries, gateway, Redis, Docker, K8s, idempotency/saga/tracing themes. **PostgreSQL → MongoDB** is a deliberate MERN migration; slides that say “ACID Postgres per service” should be read as **“strong local consistency per service DB”** with Mongo + app logic. |
| **PPT (midterm check).pptx** | States **MERN**; services User, Product, Cart, Order, Payment, Review; gateway; Redis on product/cart; Docker Compose + K8s. | **Strong match** to the current codebase. Minor wording differences: slides mention **Redux** for cart; implementation uses **React Context** (`CartContext`) — same role. |
| **Project Status Update.pptx** | Mixed roadmap: Next.js + FastAPI/NestJS + PostgreSQL in “next steps”; also catalog/BOM, forum path, HPA, tracing. | **Partial match**: BOM/customize exists on **product-service**; **Forum** exists as **forum-service**. Frontend is **React+Vite**, not Next.js — treat status deck as **evolving roadmap**, not the only allowed stack. |
| **Aos_proposal.pptx** | **Different product domain** (online learning / LMS-style services: Auth, Content, Progress) with **Node gateway** and **MongoDB per service**. | Useful for **OS/distributed concepts** and Mongo wording; **not** the BitForge e-commerce feature list. Do not confuse this deck’s “courses” with DIY kits in grading narrative. |

## Requirement checklist (aggregated)

| Theme | From materials | Current implementation |
|-------|----------------|-------------------------|
| Microservices | User, Product, Order, Payment (+ Cart, Review in midterm) | **user**, **product**, **order**, **payment**, **cart**, **review**, **forum** |
| Frontend | React + Vite SPA | `frontend/` (Vite); proxies `/api` → gateway |
| API Gateway | Nginx or Kong; routing, rate limits | **nginx** `gateway/nginx.conf` on **8080** with `limit_req` zones |
| DB isolation | Separate DB per service | **Separate MongoDB database name per service** on one Mongo container |
| Cache | Redis | **Redis**; product + cart caching as implemented |
| Auth | JWT; gateway “auth” in some slides | **JWT issued by user-service**; services validate Bearer tokens; gateway forwards `Authorization` |
| Containers / K8s | Docker images; K8s manifests | `docker-compose.yml`; `k8s/` (Mongo, Redis, services, gateway, HPA, NetworkPolicies, OTel, Jaeger) |
| Observability | Jaeger / OpenTelemetry mentioned | **OTel** SDK in services + **collector** + **Jaeger** in compose |
| Saga / idempotency | Mentioned in BitForge slides | **Idempotency** records on order/payment writes; **cancel** path for payment failure |

## Intentional deviations (document for professors)

1. **PostgreSQL vs MongoDB**: Course decks often say Postgres; the **approved MERN migration** uses **MongoDB** with the same **database-per-service** idea.
2. **Gateway JWT verification**: Many slides imply the gateway validates JWT. Here the gateway **routes and rate-limits**; **services enforce JWT** (common pattern; can be moved to nginx `auth_request` later if required).
3. **“Node.js API Gateway” in Aos_proposal**: The **gateway in this repo is nginx**, not a Node process — still valid as the **single entry** to the cluster.
4. **Aos_proposal domain**: LMS narrative ≠ DIY kits; use **BitForge + Architecture-AOS + midterm** for marketplace grading story.

## Suggested slide updates (optional, for presentation parity)

- Replace “PostgreSQL only” with **“MongoDB (per service)”** where you describe the current repo.
- Replace “Next.js” in **Project Status Update** with **“React + Vite”** if showing this codebase.
- Note **forum-service** if slides still say “forum path TBD.”

## Still open (called out in midterm / status decks)

These are roadmap items, not blockers for “matches the architecture”:

- Automated test suites (unit / integration / e2e)
- CI/CD pipeline
- Rotating secrets and stricter production config
- Optional: Prometheus/Grafana (mentioned as future in BitForge slides)
