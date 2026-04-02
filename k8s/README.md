# Kubernetes Manifests (Microservices)

This folder contains starter manifests for deploying the microservices stack.

## Files
- `namespace.yaml`: namespace for all resources
- `configmap.yaml`: shared non-secret environment configuration
- `secret.example.yaml`: template for DB/JWT secrets (rename to `secret.yaml`)
- `deployments.yaml`: Deployments + Services for redis, gateway, and all microservices

## Usage
1. Build and push container images for each service.
2. Update image names in `deployments.yaml`.
3. Create `secret.yaml` from `secret.example.yaml` with real values.
4. Apply manifests:
   ```bash
   kubectl apply -f k8s/namespace.yaml
   kubectl apply -f k8s/configmap.yaml
   kubectl apply -f k8s/secret.yaml
   kubectl apply -f k8s/deployments.yaml
   ```

## Notes
- Service communication is internal via Kubernetes service DNS.
- Redis is included for cache/session/cart acceleration.
- Existing MongoDB Atlas URIs can be used through the secret keys.
