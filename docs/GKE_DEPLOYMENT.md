# GKE Deployment Runbook (Terraform Baseline)

This runbook deploys the current BitForge manifests onto a managed GKE cluster with minimal manifest changes.

## 1) Provision GKE with Terraform

```bash
cd maker-platform/infra/terraform/gke
cp terraform.tfvars.example terraform.tfvars
# edit terraform.tfvars with your project and preferred sizing

terraform init
terraform plan
terraform apply
```

After apply:

```bash
gcloud container clusters get-credentials maker-platform-gke --zone us-central1-a --project <your-project-id>
```

## 2) Build and Push Images to Artifact Registry

Create a registry (one-time):

```bash
gcloud artifacts repositories create maker-platform \
  --repository-format=docker \
  --location=us-central1 \
  --description="BitForge microservices images"
```

Configure Docker auth:

```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
```

Build and push each service image (example tag):

```bash
export PROJECT_ID=<your-project-id>
export TAG=v1
export REG=us-central1-docker.pkg.dev/${PROJECT_ID}/maker-platform

docker build -t ${REG}/user-service:${TAG} maker-platform/microservices/user-service
docker push ${REG}/user-service:${TAG}

docker build -t ${REG}/product-service:${TAG} maker-platform/microservices/product-service
docker push ${REG}/product-service:${TAG}

docker build -t ${REG}/order-service:${TAG} maker-platform/microservices/order-service
docker push ${REG}/order-service:${TAG}

docker build -t ${REG}/payment-service:${TAG} maker-platform/microservices/payment-service
docker push ${REG}/payment-service:${TAG}

docker build -t ${REG}/cart-service:${TAG} maker-platform/microservices/cart-service
docker push ${REG}/cart-service:${TAG}

docker build -t ${REG}/review-service:${TAG} maker-platform/microservices/review-service
docker push ${REG}/review-service:${TAG}

docker build -t ${REG}/forum-service:${TAG} maker-platform/microservices/forum-service
docker push ${REG}/forum-service:${TAG}
```

## 3) Patch Deployment Image References

Update `maker-platform/k8s/deployments.yaml` image entries from local tags (for example, `maker-user-service:dev`) to Artifact Registry image URLs:

- `${REG}/user-service:${TAG}`
- `${REG}/product-service:${TAG}`
- `${REG}/order-service:${TAG}`
- `${REG}/payment-service:${TAG}`
- `${REG}/cart-service:${TAG}`
- `${REG}/review-service:${TAG}`
- `${REG}/forum-service:${TAG}`

The gateway can stay on `nginx:1.25-alpine`.

## 4) Secrets and Config

Create production secrets before deploying:

```bash
kubectl create namespace maker-platform --dry-run=client -o yaml | kubectl apply -f -

kubectl -n maker-platform create secret generic maker-secrets \
  --from-literal=JWT_SECRET='<strong-jwt-secret>'
```

If needed, adjust `k8s/configmap.yaml` values for:

- `SERVICE_TOKEN`
- `PRODUCT_SERVICE_URL`, `ORDER_SERVICE_URL`, `PAYMENT_SERVICE_URL`
- Mongo/Redis service names if using managed equivalents

## 5) Deploy Manifests

```bash
cd maker-platform
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployments.yaml
```

## 6) Validate

```bash
kubectl get pods -n maker-platform
kubectl get svc -n maker-platform
kubectl get hpa -n maker-platform
kubectl logs deploy/gateway -n maker-platform --tail=100
```

Expected outcomes:

- All deployments become `Ready`.
- `gateway` service receives an external IP (LoadBalancer).
- `/health` on gateway returns `200`.
- Auth-protected routes return `401` when token is missing.

## 7) Optional Hardening Next Steps

- Replace in-cluster Mongo/Redis with managed services.
- Store secrets in Secret Manager + External Secrets.
- Add Cloud Monitoring dashboards/alerts for p95, errors, and HPA scale events.
