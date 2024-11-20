#!/bin/bash

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Check if backend is healthy
echo "Checking backend health..."
HEALTH_CHECK_URL="http://localhost:3002/health/"
MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_CHECK_URL)
    if [ "$RESPONSE" = "200" ]; then
        echo "Backend is healthy!"
        break
    fi
    echo "Backend not ready yet (attempt $((RETRY_COUNT+1))/$MAX_RETRIES)..."
    RETRY_COUNT=$((RETRY_COUNT+1))
    sleep 5
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "Error: Backend health check failed after $MAX_RETRIES attempts"
    exit 1
fi

echo "Post-deploy checks completed successfully"
exit 0
