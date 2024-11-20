FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    netcat-openbsd \
    dos2unix \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy entrypoint script first
COPY entrypoint.sh .
RUN dos2unix entrypoint.sh && \
    chmod +x entrypoint.sh && \
    ls -la entrypoint.sh  # Verify file exists and permissions

# Create necessary directories with proper permissions
RUN mkdir -p /app/static /app/media /app/upload_temp && \
    chmod -R 755 /app/static /app/media /app/upload_temp

# Copy project files
COPY . .

# Ensure entrypoint script has proper permissions after final copy
RUN chmod +x /app/entrypoint.sh && \
    ls -la /app/entrypoint.sh && \
    chown -R root:root /app && \
    chmod -R 755 /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8000

# Set entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]
