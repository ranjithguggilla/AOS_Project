#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT_DIR="${ROOT_DIR}/load/results/$(date +%Y%m%d-%H%M%S)"
BASE_URL="${BASE_URL:-http://localhost:8080}"
NAMESPACE="${NAMESPACE:-maker-platform}"
PROM_URL="${PROM_URL:-http://localhost:9090}"

mkdir -p "${OUT_DIR}"

echo "Output directory: ${OUT_DIR}"

run_k6() {
  local script="$1"
  local output="$2"
  set +e
  k6 run \
    --out json="${output}" \
    -e BASE_URL="${BASE_URL}" \
    "${script}" | tee "${output%.json}.log"
  local k6_exit="${PIPESTATUS[0]}"
  set -e
  echo "${k6_exit}" > "${output%.json}.exit_code"
  if [[ "${k6_exit}" -ne 0 ]]; then
    echo "WARNING: k6 scenario ${script} exited with ${k6_exit}" | tee -a "${output%.json}.log"
  fi
}

echo "Running k6 product browse scenario..."
run_k6 "${ROOT_DIR}/load/k6/product-browse.js" "${OUT_DIR}/k6-product-browse.json"

echo "Running k6 checkout scenario..."
run_k6 "${ROOT_DIR}/load/k6/checkout-flow.js" "${OUT_DIR}/k6-checkout-flow.json"

echo "Capturing Kubernetes HPA and pod metrics..."
kubectl get hpa -n "${NAMESPACE}" > "${OUT_DIR}/kubectl-hpa.txt"
kubectl get pods -n "${NAMESPACE}" -o wide > "${OUT_DIR}/kubectl-pods.txt"
kubectl top pods -n "${NAMESPACE}" > "${OUT_DIR}/kubectl-top-pods.txt" || true

echo "Capturing Prometheus query snapshots..."
curl -fsS "${PROM_URL}/api/v1/query?query=histogram_quantile(0.95,sum%20by%20(le,service)(rate(http_request_duration_seconds_bucket%5B5m%5D)))" \
  > "${OUT_DIR}/prometheus-p95.json" || true
curl -fsS "${PROM_URL}/api/v1/query?query=histogram_quantile(0.99,sum%20by%20(le,service)(rate(http_request_duration_seconds_bucket%5B5m%5D)))" \
  > "${OUT_DIR}/prometheus-p99.json" || true
curl -fsS "${PROM_URL}/api/v1/query?query=sum%20by%20(service)(rate(http_request_duration_seconds_count%5B5m%5D))" \
  > "${OUT_DIR}/prometheus-rps.json" || true

echo "Evidence captured under ${OUT_DIR}"
