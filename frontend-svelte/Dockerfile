# Build stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies using npm install
RUN npm install

# Copy source code
COPY . .

# Set environment variables for build
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create nginx directories with proper permissions
RUN mkdir -p /var/cache/nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx /usr/share/nginx/html && \
    chmod -R 755 /var/cache/nginx /usr/share/nginx/html

# Copy built files from build stage
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget -q --spider http://localhost:80/ || exit 1

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
