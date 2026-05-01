#!/bin/bash
# Rebuild and push all microservice images for linux/amd64 platform using Docker Buildx
set -e

SERVICES=(
  user-service
  product-service
  cart-service
  order-service
  payment-service
  review-service
  forum-service
)

DOCKER_USER=madhu4011
PLATFORM=linux/amd64

for SERVICE in "${SERVICES[@]}"; do
  echo "\nBuilding and pushing $SERVICE for $PLATFORM..."
  cd "$(dirname "$0")/$SERVICE"
  docker buildx build --platform $PLATFORM -t $DOCKER_USER/$SERVICE:latest --push .
  cd - > /dev/null
  echo "$SERVICE done."
done
