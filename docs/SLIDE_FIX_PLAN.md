# Slide/Code Convergence Plan

## Goal

Make presentation content and repository implementation fully consistent for final grading, with no stack ambiguity.

This plan is split into:

1. **What to change in slides** (fastest path; reflects current code truth)
2. **What to change in code** (to close remaining technical gaps)

---

## Decision lock (apply first)

Use this as canonical across all decks and docs:

- **Frontend:** React + Vite + TypeScript
- **Gateway:** nginx (single entry point)
- **Backend services:** Node.js + Express (User, Product, Cart, Order, Payment, Review, Forum)
- **Data:** MongoDB (database-per-service) + Redis cache
- **Observability:** OpenTelemetry + Jaeger + Prometheus + Grafana
- **Deploy:** Docker Compose + Kubernetes manifests

Do **not** mix with “Next.js + FastAPI/NestJS + PostgreSQL” wording unless clearly labeled as future work.

---

## A) What to change in slides

## 1) Global replacements (all decks)

- Replace `PostgreSQL` with `MongoDB (database-per-service)` where talking about **current implementation**.
- Replace `Nginx / Kong` with `nginx` (unless slide explicitly says “alternative considered”).
- Replace `Next.js` with `React + Vite`.
- Replace `FastAPI`-specific phrasing with `Node.js/Express microservices`.
- Replace `Redux cart state` references with `React Context cart state` (or neutral phrase: “frontend state management”).

## 2) `Project Status Update.pptx` edits

- Slide 2, 3, 11:
  - Change “Next.js direction” to “React + Vite integrated and running”.
  - Remove “FastAPI/NestJS + PostgreSQL” as stack target for this build.
  - Keep as “future experiment” only if you want a roadmap slide.
- Slide 9:
  - Change “Forum roadmap” to “Forum service implemented (MVP), enhancements pending”.

## 3) `BitForge Presentation.pptx` / `BitForge Slides.docx` edits

- Stack slide:
  - Change DB line to MongoDB per service + Redis cache.
  - Keep ACID discussion as “local consistency and idempotency safeguards”.
- Algorithms/protocol slide:
  - Mark outbox/broker as “in progress” unless implemented before final.
- Evaluation slide:
  - Keep load metrics targets only if measured charts/screenshots are included.

## 4) `Aos_proposal.pptx` usage guidance

- If included in final deck bundle, add a label on title or intro:
  - “Earlier concept proposal (different domain), reused for OS concepts only.”
- Avoid presenting LMS feature claims as if they are in BitForge.

---

## B) What to change in code/repo

## 1) Must-do (to match high-confidence slide claims)

- Add/finish **automated testing baseline**:
  - service-level unit tests for user/product/order/payment
  - one integration happy path (register -> browse -> order -> payment)
- Add **CI pipeline**:
  - lint + test + build workflow in GitHub Actions
- Add **load-test artifacts**:
  - k6 or Locust scripts
  - captured p95/p99 + throughput evidence screenshots
- Add **consolidated evidence doc**:
  - one page mapping “claim -> screenshot/log/command output”.

## 2) Should-do (to match advanced distributed claims)

- Formalize **outbox or broker** pattern:
  - standardize event publication approach across order/payment flows
- Harden **oversell strategy**:
  - explicit concurrency strategy note + implementation guard (versioning/transaction discipline)
- Add **access/refresh token split**:
  - refresh flow and token rotation policy

## 3) Nice-to-have (if time permits)

- Shared OpenAPI/contracts package structure
- Typed shared frontend API client package
- Graceful shutdown verification script and runbook section

---

## C) Exact mapping template for final deck

Use this per major claim in final slides:

- **Claim:** <slide statement>
- **Repo proof:** <file path(s)>
- **Demo proof:** <command/screenshot/log>
- **Status:** Implemented / Partial / Planned

This should mirror `STRICT_SLIDE_COMPLIANCE_AUDIT.md`.

---

## D) Priority sequence (recommended)

1. **Slide truth alignment** (wording updates first, 1-2 hours)
2. **CI + basic tests** (highest grading value)
3. **Load-test evidence + HPA screenshots**
4. **Outbox/oversell/access-refresh hardening**
5. **Optional structure cleanup (contracts/shared layout)**

---

## E) Final acceptance checklist

- No slide claims a stack different from repo reality (unless marked future work).
- Every non-trivial architecture claim has a file-path proof.
- Every performance/reliability claim has runtime evidence.
- “Partial” items are explicitly framed as next sprint items, not done work.

