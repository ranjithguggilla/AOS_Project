# Mern-Ecommerce-website 
[![Generic badge](https://img.shields.io/badge/Responsive-Yes-<COLOR>.svg)](https://eastclothing.herokuapp.com/) 
## E-Commerce Website Using MERN STACK. 



#### The main objetif behind this projet was to build an Ecommerce website that handles both sides client and admin using the next technologies :  

 1. Mongo Db  
 
 2. Expressjs  
 
 3. Reactjs  
 4. Nodejs  
 5. Chakra Ui  
 6. Redux  

Here is a Demo : [Demo](https://eastclothing.herokuapp.com/)

If you are logged in as an admin a button in navbar will show up which gives you controll on your products,users and orders.

- The button :
<img width = "800" src="https://i.imgur.com/a7YFo86.png"/>  

- Products :
<img width = "800" src="https://i.imgur.com/AMrzaZW.png"/>

- Add or Edit :
<img width = "300" src="https://i.imgur.com/p725woy.png"/>
<img width = "300" src="https://i.imgur.com/80E5x6p.png"/>

- Users :
<img width = "800" src="https://i.imgur.com/sCdikSM.png"/>  

- Edit :
<img width = "300" src="https://i.imgur.com/U7LXWm0.png"/>

- Orders :
<img width = "800" src="https://i.imgur.com/wyyvpYQ.png"/>

- After clicking on details you can deliver the order if its paid :
<img width = "800" src="https://i.imgur.com/Q9mX0X5.png"/>

[![forthebadge](https://forthebadge.com/images/badges/built-with-love.svg)](https://forthebadge.com) [![forthebadge](https://forthebadge.com/images/badges/made-with-javascript.svg)](https://forthebadge.com)
[![Support via PayPal](https://cdn.rawgit.com/twolfson/paypal-github-button/1.0.0/dist/button.svg)](https://www.paypal.me/abourhjoul/)

## Microservices Backend (New)

The project now includes a microservices backend under `microservices/`:

- API Gateway
- User Service
- Product Service
- Cart Service
- Order Service
- Payment Service
- Review Service

Each service owns a dedicated database namespace:

- User Service -> `UserDB`
- Product Service -> `products`
- Cart Service -> `CartDB`
- Order Service -> `OrderDB`
- Payment Service -> `PaymentDB`
- Review Service -> `ReviewDB`

### Request Flow

`Frontend -> API Gateway -> Microservices`

Inter-service communication already implemented:

- Order Service -> Product Service (`/api/products/internal/stock-check`, `/api/products/internal/decrement-stock`)
- Order Service -> Payment Service (`/api/payments/process`)

Gateway routing:

- `/api/users` -> User Service
- `/api/products` -> Product Service
- `/api/cart` -> Cart Service
- `/api/orders` -> Order Service
- `/api/payments` -> Payment Service
- `/api/reviews` -> Review Service

### New APIs

- Product Search: `GET /api/products/search?keyword=`
- Product Category Filtering: `GET /api/products?category=sensors`
- Cart APIs:
	- `POST /api/cart/add`
	- `DELETE /api/cart/remove`
	- `PUT /api/cart/update`
	- `GET /api/cart/:userId`
- Order Tracking APIs:
	- `POST /api/orders`
	- `GET /api/orders/:userId`
	- `PUT /api/orders/status`
- Review APIs:
	- `POST /api/reviews`

## Deployment & Infra (Presentation Enhancements)

### 1) Docker / Docker Compose

- Base image: `Dockerfile.micro`
- Orchestration: `docker-compose.yml`
- Services included: gateway + user/product/cart/order/payment/review + redis

Run:

```bash
docker compose up --build
```

### 2) Redis (Cache-ready)

- `docker-compose.yml` includes a `redis` service
- `REDIS_URL` is wired for services (`redis://redis:6379`)
- Implemented cache usage:
	- Product Service: caches `GET /api/products`, `GET /api/products/search`, `GET /api/products/:id`
	- Cart Service: caches `GET /api/cart/:userId`
- Cache invalidation:
	- Product caches are invalidated on product create and stock decrement
	- Cart cache is invalidated on add/remove/update/clear

### 3) Kubernetes Manifests

See `k8s/`:

- `namespace.yaml`
- `configmap.yaml`
- `secret.example.yaml`
- `deployments.yaml`

Quick start:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployments.yaml
```
	- `GET /api/reviews/:productId`

### Service Communication

- `Order Service -> Product Service` for stock check/decrement
- `Order Service -> Payment Service` for payment processing

### Run Microservices + Frontend

From project root:

`npm run micro:dev`

This starts all services, gateway, and frontend.

