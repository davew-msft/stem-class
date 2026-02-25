# ============================================================================
# Rescan - Docker Build
# ============================================================================
# Single-stage build using full Node.js image (required for sqlite3 native addon)

FROM node:20-slim

LABEL maintainer="STEM Class Project" \
      description="Educational recycling scanner application" \
      version="1.0.0"

WORKDIR /app

# Install build tools needed for sqlite3 native addon
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

# Copy package files first for layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && \
    # Remove build tools after compilation to keep image smaller
    apt-get purge -y --auto-remove python3 make g++ && \
    rm -rf /root/.npm /tmp/*

# Copy application source code
COPY . .

# Create uploads directory (data dir will come from source or volume mount)
RUN mkdir -p /app/backend/public/uploads

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the application
CMD ["node", "backend/src/api/server.js"]

# ============================================================================
# Build:  docker build -t rescan:latest .
# Run:    docker run -p 3000:3000 --env-file .env -v ./data:/app/data rescan:latest
# ============================================================================
