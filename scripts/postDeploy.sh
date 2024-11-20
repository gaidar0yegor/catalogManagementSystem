#!/bin/bash

# Login to Docker Hub to avoid rate limits
echo "${DOCKER_PASSWORD}" | docker login -u "${DOCKER_USERNAME}" --password-stdin

# Pull latest images and rebuild
docker-compose pull
docker-compose build --no-cache

# Restart services with new images
docker-compose up -d

# Wait for services to be ready
sleep 15

# Run migrations and collect static files
docker-compose exec -T backend python manage.py migrate
docker-compose exec -T backend python manage.py collectstatic --noinput

# Restart Nginx to ensure proper static file serving
docker-compose restart nginx

# Health check
HEALTH_CHECK_URL="https://catalogmanagementsystem-u23037.vm.elestio.app/health"
MAX_RETRIES=5
RETRY_INTERVAL=10

for i in $(seq 1 $MAX_RETRIES); do
    if curl -f "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
        echo "Deployment health check passed"
        exit 0
    fi
    echo "Health check attempt $i failed, retrying in $RETRY_INTERVAL seconds..."
    sleep $RETRY_INTERVAL
done

echo "Deployment health check failed after $MAX_RETRIES attempts"
exit 1
