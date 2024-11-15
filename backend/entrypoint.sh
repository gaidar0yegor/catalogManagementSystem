#!/bin/sh

set -e

# Function to wait for a service
wait_for_service() {
    local host="$1"
    local port="$2"
    local service="$3"
    local timeout=30

    echo "Waiting for $service..."
    for i in $(seq 1 $timeout); do
        if nc -z "$host" "$port"; then
            echo "$service is up!"
            return 0
        fi
        echo "Waiting for $service... $i/$timeout"
        sleep 1
    done
    echo "$service failed to start within $timeout seconds"
    return 1
}

# Wait for PostgreSQL
wait_for_service "db" "5432" "PostgreSQL"

# Wait for Redis if using Celery
if [ -n "$CELERY_BROKER_URL" ]; then
    wait_for_service "redis" "6379" "Redis"
fi

# Check if this is the Celery worker
if [ "$1" = "celery" ]; then
    echo "Starting Celery worker..."
    exec celery -A stock_management worker -l info
else
    # Collect static files
    echo "Collecting static files..."
    python manage.py collectstatic --noinput

    # Apply database migrations
    echo "Applying database migrations..."
    python manage.py migrate --noinput

    # Create cache tables
    echo "Creating cache tables..."
    python manage.py createcachetable

    # Start Gunicorn
    echo "Starting Gunicorn..."
    exec gunicorn stock_management.wsgi:application \
        --bind 0.0.0.0:8000 \
        --workers 3 \
        --threads 2 \
        --worker-class=gthread \
        --worker-tmp-dir=/dev/shm \
        --access-logfile - \
        --error-logfile - \
        --log-level=info \
        --capture-output \
        --enable-stdio-inheritance \
        --timeout 120
fi
