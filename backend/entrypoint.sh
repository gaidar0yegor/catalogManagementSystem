#!/bin/sh

# Wait for database to be ready
echo "Waiting for PostgreSQL..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL started"

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate

# Load initial data
echo "Loading initial data..."
python manage.py loaddata stock_app/fixtures/initial_data.json

# Start server
echo "Starting server..."
python manage.py runserver 0.0.0.0:8000
