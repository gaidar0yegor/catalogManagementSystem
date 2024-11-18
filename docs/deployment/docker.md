# Docker Configuration Guide

## Overview

This guide provides detailed information about the Docker configuration used in the Stock Management System.

## Services

The application consists of the following services:

### Backend (Django)
```yaml
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile
  volumes:
    - ./backend:/app
    - static_volume:/app/static
    - media_volume:/app/media
  environment:
    - DJANGO_SETTINGS_MODULE=stock_management.settings
    - DATABASE_URL=postgres://postgres:postgres@db:5432/stock_db
    - REDIS_URL=redis://redis:6379/0
  depends_on:
    - db
    - redis
```

### Frontend (Svelte)
```yaml
frontend:
  build:
    context: ./frontend-svelte
    dockerfile: Dockerfile
  volumes:
    - ./frontend-svelte:/app
    - /app/node_modules
```

### Database (PostgreSQL)
```yaml
db:
  image: postgres:13
  volumes:
    - postgres_data:/var/lib/postgresql/data
    - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
  environment:
    - POSTGRES_DB=stock_db
    - POSTGRES_USER=postgres
    - POSTGRES_PASSWORD=postgres
```

### Redis
```yaml
redis:
  image: redis:7-alpine
  volumes:
    - redis_data:/data
```

### Celery Worker
```yaml
celery:
  build:
    context: ./backend
    dockerfile: Dockerfile
  command: celery -A stock_management worker --loglevel=info
  volumes:
    - ./backend:/app
  environment:
    - DJANGO_SETTINGS_MODULE=stock_management.settings
    - DATABASE_URL=postgres://postgres:postgres@db:5432/stock_db
    - REDIS_URL=redis://redis:6379/0
  depends_on:
    - backend
    - redis
```

### Nginx
```yaml
nginx:
  build:
    context: ./docker/nginx
    dockerfile: Dockerfile
  volumes:
    - static_volume:/var/www/static
    - media_volume:/var/www/media
  ports:
    - "80:80"
  depends_on:
    - backend
    - frontend
```

## Dockerfile Configurations

### Backend Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    netcat-traditional \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create non-root user
RUN addgroup --system appgroup && \
    adduser --system --group appuser && \
    chown -R appuser:appgroup /app

# Create media and static directories
RUN mkdir -p /app/media /app/static && \
    chown -R appuser:appgroup /app/media /app/static && \
    chmod -R 777 /app/media /app/static

# Copy application code
COPY --chown=appuser:appgroup . .

# Copy and set permissions for entrypoint script
COPY --chown=appuser:appgroup entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER appuser

ENTRYPOINT ["/entrypoint.sh"]
```

### Frontend Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create cache directory with proper permissions
RUN mkdir -p /var/cache/nginx && \
    chown -R nginx:nginx /var/cache/nginx && \
    chmod -R 755 /var/cache/nginx
```

### Nginx Dockerfile
```dockerfile
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/
```

## Volume Configuration

```yaml
volumes:
  postgres_data:  # Persistent database storage
  redis_data:     # Redis data storage
  static_volume:  # Django static files
  media_volume:   # User-uploaded media files
```

## Network Configuration

All services are connected through a default Docker network created by Docker Compose.

## Environment Variables

Create a `.env` file in the project root:

```env
# Django
DJANGO_SETTINGS_MODULE=stock_management.settings
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=0
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=stock_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432

# Redis
REDIS_URL=redis://redis:6379/0

# Email
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USE_TLS=1
EMAIL_HOST_USER=your-email@example.com
EMAIL_HOST_PASSWORD=your-email-password
```

## Development vs Production

### Development
- Source code is mounted as volumes
- Debug mode enabled
- Hot reloading enabled
- No SSL configuration

### Production
- Built code is copied into containers
- Debug mode disabled
- SSL configured in Nginx
- Proper security headers
- Rate limiting enabled

## Common Tasks

### Building Images
```bash
docker-compose build
```

### Starting Services
```bash
docker-compose up -d
```

### Viewing Logs
```bash
docker-compose logs -f [service_name]
```

### Executing Commands
```bash
# Django management commands
docker-compose exec backend python manage.py [command]

# Database backup
docker-compose exec db pg_dump -U postgres stock_db > backup.sql

# Frontend commands
docker-compose exec frontend npm run [command]
```

### Scaling Services
```bash
docker-compose up -d --scale backend=3
```

## Troubleshooting

1. Database connection issues:
```bash
docker-compose exec backend python manage.py dbshell
```

2. Redis connection:
```bash
docker-compose exec redis redis-cli ping
```

3. Container logs:
```bash
docker-compose logs -f [service_name]
```

4. Rebuild specific service:
```bash
docker-compose up -d --build [service_name]
```

## Security Considerations

1. Use non-root users in containers
2. Implement proper volume permissions
3. Configure security headers in Nginx
4. Use environment variables for sensitive data
5. Regular security updates
6. Proper network isolation
7. Rate limiting configuration
