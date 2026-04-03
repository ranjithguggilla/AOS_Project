# Load and HPA Evidence Pack

This document standardizes how to generate and present formal performance evidence for BitForge.

## Scope

- `p95` and `p99` latency evidence for browse and checkout paths.
- Throughput trend under sustained load.
- Product service HPA behavior when CPU target is exceeded.

## Prerequisites

- Running stack (Docker Compose or Kubernetes).
- `k6` installed locally.
- `kubectl` access to the `maker-platform` namespace when collecting HPA proof.
- Optional: Prometheus endpoint reachable (default `http://localhost:9090`).

## Workload Scripts

- Browse scenario: `load/k6/product-browse.js`
- Checkout scenario: `load/k6/checkout-flow.js`

## One-Command Evidence Capture

```bash
cd maker-platform
BASE_URL=http://localhost:8080 NAMESPACE=maker-platform PROM_URL=http://localhost:9090 ./scripts/load/capture_evidence.sh
```

Artifacts are stored in `load/results/<timestamp>/`:

- `k6-product-browse.json`, `k6-product-browse.log`
- `k6-checkout-flow.json`, `k6-checkout-flow.log`
- `kubectl-hpa.txt`
- `kubectl-pods.txt`
- `kubectl-top-pods.txt`
- `prometheus-p95.json`
- `prometheus-p99.json`
- `prometheus-rps.json`

## Reporting Template

Use this structure in project reports/slides:

| Metric | Browse | Checkout | Notes |
|---|---:|---:|---|
| Avg latency | TBD | TBD | from k6 summary |
| p95 latency | TBD | TBD | must satisfy target |
| p99 latency | TBD | TBD | must satisfy target |
| Error rate | TBD | TBD | target `< 1-2%` |
| Peak RPS | TBD | TBD | from Prometheus/k6 |

## HPA Evidence Checklist

1. Confirm HPA target for `product-service` (`averageUtilization: 70`).
2. Run `checkout-flow.js` for sustained load window.
3. Capture:
   - `kubectl get hpa -n maker-platform` before, during, after
   - `kubectl top pods -n maker-platform` during peak
   - Prometheus p95/p99 and RPS query snapshots
4. Show a timeline in slides:
   - load starts
   - CPU rises above threshold
   - replicas scale out
   - latency stabilizes

## Acceptance Criteria

- Gateway/API remains functional during test run.
- `http_req_failed` within thresholds.
- p95/p99 remain under agreed bounds for each scenario.
- HPA shows replica increase under sustained pressure and recovery after load drops.
