# Kubernetes deploy (nginx gateway)

This folder deploys the same `maker-platform` stack:

- mongo + redis
- user/product/order/payment/cart/review/forum services
- nginx API gateway
- nginx-exporter + prometheus + grafana
- HPA on `product-service`

## 1) Build images

From `maker-platform/`:

```bash
docker build -t maker-user-service:dev microservices/user-service
docker build -t maker-product-service:dev microservices/product-service
docker build -t maker-order-service:dev microservices/order-service
docker build -t maker-payment-service:dev microservices/payment-service
docker build -t maker-cart-service:dev microservices/cart-service
docker build -t maker-review-service:dev microservices/review-service
docker build -t maker-forum-service:dev microservices/forum-service
```

If using minikube:

```bash
minikube image load maker-user-service:dev
minikube image load maker-product-service:dev
minikube image load maker-order-service:dev
minikube image load maker-payment-service:dev
minikube image load maker-cart-service:dev
minikube image load maker-review-service:dev
minikube image load maker-forum-service:dev
```

## 2) Apply manifests

```bash
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secret.example.yaml
kubectl apply -f deployments.yaml
```

## 3) Access gateway

```bash
kubectl -n maker-platform port-forward svc/gateway 8080:8080
```

Then call:

- `http://localhost:8080/health`
- `http://localhost:8080/api/products`
- `http://localhost:8080/health` (check `X-Request-Id` header)

Monitoring (port-forward in separate terminals):

```bash
kubectl -n maker-platform port-forward svc/prometheus 9090:9090
kubectl -n maker-platform port-forward svc/grafana 3000:3000
```

- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3000` (`admin` / `admin`)

## Notes

- `secret.example.yaml` is a template; replace secrets for non-demo use.
- Gateway now propagates/generates `X-Request-Id` and forwards it to all services.
- Circuit-breaker logic is in service code (order↔product and payment↔order); manifests here provide parity infrastructure only.
