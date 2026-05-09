# Madhusudhan Handoff (Frontend & Product Catalog)

## Ownership paths

- `frontend/**`
- `microservices/product-service/**`
- `microservices/cart-service/**`
- `microservices/order-service/**`
- `load/**`

## Git commands (Mac / Linux)

```bash
cd <repo-root>
git checkout main
git pull origin main
git checkout -b madhu/<task-name>

git add frontend/ microservices/product-service/ microservices/cart-service/ microservices/order-service/ load/
git status --short

git commit -m "feat(frontend-product): <short summary>"
git push -u origin madhu/<task-name>
```

## Git commands (Windows PowerShell)

```powershell
Set-Location <repo-root>
git checkout main
git pull origin main
git checkout -b madhu/<task-name>

git add frontend/ microservices/product-service/ microservices/cart-service/ microservices/order-service/ load/
git status --short

git commit -m "feat(frontend-product): <short summary>"
git push -u origin madhu/<task-name>
```

## PR title examples

- `feat(frontend): improve checkout and auth UX`
- `feat(product): optimize catalog search and caching`
