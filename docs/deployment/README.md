# Deployment Guide

## Overview

This guide covers the deployment options for the Stock Management System. The application can be deployed using Docker containers (recommended) or manually.

## Docker Deployment (Recommended)

For detailed Docker deployment instructions, see [Docker Configuration Guide](docker.md).

Quick start:
```bash
# Build and start all services
docker-compose up --build

# Access the application
Frontend: http://localhost:5173
Backend API: http://localhost:8000/api
```

## Manual Deployment

If you prefer not to use Docker, you can deploy the application manually.

### Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL 13+
- Nginx

### Backend Deployment

1. Set up Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
```bash
export DEBUG=False
export SECRET_KEY=your-secret-key
export DATABASE_URL=postgres://user:password@localhost:5432/dbname
export ALLOWED_HOSTS=your-domain.com
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Collect static files:
```bash
python manage.py collectstatic --no-input
```

6. Configure Gunicorn:
```bash
gunicorn stock_management.wsgi:application --bind 0.0.0.0:8000
```

### Frontend Deployment

1. Install dependencies:
```bash
cd frontend-svelte
npm install
```

2. Build for production:
```bash
npm run build
```

3. Configure environment:
```bash
echo "VITE_API_URL=https://api.your-domain.com" > .env
```

### Nginx Configuration

```nginx
# Frontend configuration
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/frontend-svelte/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## SSL Configuration

1. Install Certbot:
```bash
apt-get install certbot python3-certbot-nginx
```

2. Obtain certificate:
```bash
certbot --nginx -d your-domain.com
```

## Database Setup

1. Create database:
```sql
CREATE DATABASE stock_db;
CREATE USER stock_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE stock_db TO stock_user;
```

2. Configure backup:
```bash
pg_dump dbname > backup.sql
```

## Monitoring

1. Install monitoring tools:
```bash
pip install prometheus_client
pip install sentry-sdk
```

2. Configure logging:
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/path/to/django.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

## Security Considerations

1. Enable HTTPS
2. Configure CORS properly
3. Set secure headers
4. Regular security updates
5. Implement rate limiting
6. Use secure cookies

## Performance Optimization

1. Enable caching:
```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}
```

2. Configure compression:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

## Maintenance

1. Regular backups:
```bash
0 0 * * * pg_dump dbname > /backups/db-$(date +%Y%m%d).sql
```

2. Update dependencies:
```bash
pip install --upgrade -r requirements.txt
npm update
```

3. Monitor logs:
```bash
tail -f /path/to/django.log
```

## Rollback Procedure

1. Database rollback:
```bash
psql dbname < backup.sql
```

2. Code rollback:
```bash
git checkout previous-version
```

## Troubleshooting

Common issues and solutions:

1. Database connection issues:
```bash
psql -h localhost -U username -d dbname
```

2. Static files not serving:
```bash
python manage.py collectstatic --clear
```

3. Permission issues:
```bash
chown -R www-data:www-data /path/to/static
```

## Scaling

1. Configure load balancing:
```nginx
upstream backend {
    server backend1:8000;
    server backend2:8000;
}
```

2. Cache configuration:
```python
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://redis:6379/1',
    }
}
```

Remember to always test deployments in a staging environment before applying to production.
