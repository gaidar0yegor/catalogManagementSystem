#!/bin/bash
set -e

echo "Starting entrypoint script..."

# Create necessary directories
mkdir -p /app/static
mkdir -p /app/media
mkdir -p /app/upload_temp

# Set proper permissions
chmod -R 755 /app/static
chmod -R 755 /app/media
chmod -R 755 /app/upload_temp

# Wait for database
echo "Waiting for database..."
while ! nc -z $DB_HOST $DB_PORT; do
    sleep 1
    echo "Still waiting for database..."
done
echo "Database started"

# Run migrations
echo "Running migrations..."
python manage.py migrate

# Create superuser if needed
echo "Creating superuser if not exists..."
python manage.py shell << END
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin')
END

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Create health check view
mkdir -p stock_management/health
cat > stock_management/health/views.py << EOL
from django.http import HttpResponse

def health_check(request):
    return HttpResponse("OK")
EOL

# Start Gunicorn with proper settings
echo "Starting Gunicorn..."
exec gunicorn stock_management.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level debug \
    --capture-output
