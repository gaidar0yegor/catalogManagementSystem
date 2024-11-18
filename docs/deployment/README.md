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
Frontend: http://localhost
Backend API: http://localhost/api
Admin Interface: http://localhost/admin
```

## Manual Deployment

If you prefer not to use Docker, you can deploy the application manually.

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 13+
- Redis 7+
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
export REDIS_URL=redis://localhost:6379/0
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
gunicorn stock_management.wsgi:application --bind 0.0.0.0:8000 --workers 3 --threads 2
```

7. Configure Celery:
```bash
celery -A stock_management worker --loglevel=info
```

### Frontend Deployment

1. Install dependencies:
```bash
cd frontend-svelte
npm install
```

2. Configure environment:
```bash
echo "VITE_API_URL=https://api.your-domain.com" > .env
```

3. Build for production:
```bash
npm run build
```

### Nginx Configuration

```nginx
# Main configuration
server {
    listen 80;
    server_name your-domain.com;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;
    gzip_disable "MSIE [1-6]\.";

    # Frontend
    location / {
        root /path/to/frontend-svelte/dist;
        try_files $uri $uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;
    }

    # Admin interface
    location /admin/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Requested-With' always;
    }

    # WebSocket support
    location /ws/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # Static files
    location /static/ {
        alias /path/to/static/;
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # Media files
    location /media/ {
        alias /path/to/media/;
        expires 1y;
        add_header Cache-Control "public, no-transform";
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

## Database Backup

1. Regular backups:
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/path/to/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="your_db_name"

# Create backup
pg_dump $DB_NAME > "$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
EOF

# Make script executable
chmod +x backup.sh

# Add to crontab (runs daily at 2 AM)
echo "0 2 * * * /path/to/backup.sh" | crontab -
```

## Monitoring

1. Configure Prometheus metrics:
```python
# settings.py
INSTALLED_APPS += ['django_prometheus']
MIDDLEWARE = ['django_prometheus.middleware.PrometheusBeforeMiddleware'] + MIDDLEWARE
MIDDLEWARE += ['django_prometheus.middleware.PrometheusAfterMiddleware']
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
            'formatter': 'verbose',
        },
    },
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
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

## Security Checklist

1. Enable HTTPS
2. Set secure headers in Nginx
3. Configure CORS properly
4. Enable CSRF protection
5. Set secure cookie flags
6. Implement rate limiting
7. Regular security updates
8. Database connection encryption
9. Proper file permissions
10. Firewall configuration

## Performance Optimization

1. Enable caching:
```python
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://redis:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}
```

2. Configure database connection pooling:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'your_db_name',
        'CONN_MAX_AGE': 60,
        'OPTIONS': {
            'MAX_CONNS': 20
        }
    }
}
```

## Scaling

1. Configure load balancing:
```nginx
upstream backend {
    server backend1:8000;
    server backend2:8000;
    keepalive 32;
}
```

2. Configure session persistence:
```python
SESSION_ENGINE = "django.contrib.sessions.backends.cache"
SESSION_CACHE_ALIAS = "default"
```

Remember to always test deployments in a staging environment before applying to production.
