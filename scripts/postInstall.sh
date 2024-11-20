#!/bin/bash

# Login to Docker Hub to avoid rate limits
echo "${DOCKER_PASSWORD}" | docker login -u "${DOCKER_USERNAME}" --password-stdin

# Create required directories
mkdir -p /opt/app/data/postgres
mkdir -p /opt/app/data/redis
mkdir -p /opt/app/data/static
mkdir -p /opt/app/data/media
mkdir -p /opt/app/data/upload_temp

# Set proper permissions
chown -R 1000:1000 /opt/app/data

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    # Set environment variables
    sed -i "s/DJANGO_SECRET_KEY=.*/DJANGO_SECRET_KEY=${DJANGO_SECRET_KEY}/" .env
    sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=${DB_PASSWORD}/" .env
fi

# Pull and build images
docker-compose pull
docker-compose build --no-cache

# Start services
docker-compose up -d

# Wait for services to be ready
sleep 30

# Run migrations and collect static files
docker-compose exec -T backend python manage.py migrate
docker-compose exec -T backend python manage.py collectstatic --noinput
