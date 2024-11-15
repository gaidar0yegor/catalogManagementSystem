# Docker Configuration Guide

## Overview

The application is fully containerized using Docker, with separate containers for the frontend, backend, and database services. This document details the Docker setup and configuration.

## Container Architecture

The application consists of three main services:

1. Backend (Django)
2. Frontend (Svelte)
3. Database (PostgreSQL)

## Configuration Files

### docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    environment:
      - DEBUG=1
      - DATABASE_URL=postgres://postgres:postgres@db:5432/stock_db
    depends_on:
      - db

  frontend:
    build:
      context: ./frontend-svelte
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    volumes:
      - ./frontend-svelte:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:8000/api
    depends_on:
      - backend

  db:
    image: postgres:13
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=stock_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Backend Dockerfile (backend/Dockerfile)
```dockerfile
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
```

### Backend Entrypoint Script (backend/entrypoint.sh)
```bash
#!/bin/sh

echo "Waiting for PostgreSQL..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL started"

echo "Applying database migrations..."
python manage.py migrate

echo "Loading initial data..."
python manage.py loaddata stock_app/fixtures/initial_data.json

echo "Starting server..."
python manage.py runserver 0.0.0.0:8000
```

### Frontend Dockerfile (frontend-svelte/Dockerfile)
```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration (frontend-svelte/nginx.conf)
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # Proxy API requests
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

## Usage

### Development

1. Build and start all services:
```bash
docker-compose up --build
```

2. Access the services:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api
- Database: localhost:5432

3. View logs:
```bash
docker-compose logs -f
```

4. Stop services:
```bash
docker-compose down
```

### Production Deployment

1. Build for production:
```bash
docker-compose -f docker-compose.prod.yml build
```

2. Start services:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

3. Monitor services:
```bash
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

## Data Persistence

The PostgreSQL data is persisted using a named volume `postgres_data`. This ensures that your data survives container restarts.

## Environment Variables

### Backend Environment Variables
- `DEBUG`: Enable/disable debug mode
- `DATABASE_URL`: PostgreSQL connection URL
- `SECRET_KEY`: Django secret key
- `ALLOWED_HOSTS`: Allowed host names

### Frontend Environment Variables
- `VITE_API_URL`: Backend API URL

## Common Tasks

### Accessing PostgreSQL CLI
```bash
docker-compose exec db psql -U postgres -d stock_db
```

### Running Backend Tests
```bash
docker-compose exec backend python manage.py test
```

### Creating a Superuser
```bash
docker-compose exec backend python manage.py createsuperuser
```

### Database Backup
```bash
docker-compose exec db pg_dump -U postgres stock_db > backup.sql
```

### Database Restore
```bash
cat backup.sql | docker-compose exec -T db psql -U postgres -d stock_db
```

## Troubleshooting

1. If the frontend can't connect to the backend:
   - Check if the backend container is running
   - Verify the `VITE_API_URL` environment variable
   - Check the Nginx configuration

2. If the backend can't connect to the database:
   - Check if the database container is running
   - Verify the database credentials
   - Check the database URL in the backend environment

3. If changes aren't reflecting:
   - Rebuild the containers: `docker-compose up --build`
   - Clear the Docker cache: `docker-compose build --no-cache`
