#!/bin/bash

# Make scripts executable
chmod +x scripts/postDeploy.sh

# Create necessary directories if they don't exist
mkdir -p backend/static
mkdir -p backend/media
mkdir -p backend/upload_temp

# Set proper permissions
chmod -R 755 backend/static
chmod -R 755 backend/media
chmod -R 755 backend/upload_temp

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOL
DJANGO_DEBUG=False
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,cata-u23037.vm.elestio.app
DOMAIN=cata-u23037.vm.elestio.app
DB_NAME=stock_db
DB_USER=admin
DB_PASSWORD=admin123
EOL
fi

echo "Post-install setup completed successfully"
exit 0
