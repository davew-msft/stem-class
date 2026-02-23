# ============================================================================
# Rescan - Educational Docker Multi-Stage Build
# ============================================================================
# Educational Note: Multi-stage builds create smaller, more secure images
# Stage 1: Build dependencies (full Node.js with build tools)
# Stage 2: Production runtime (minimal Alpine image)

# ============================================================================
# STAGE 1: Dependencies Installation
# ============================================================================
# Educational Note: Use full Node.js image for npm install
# This stage has all build tools needed for native dependencies
FROM node:20 AS builder

# Educational Note: Set working directory inside container
WORKDIR /app

# Educational Note: Copy only package files first (layer caching optimization)
# If package.json hasn't changed, Docker reuses this layer instead of reinstalling
COPY package*.json ./

# Educational Note: Install production dependencies only
# --only=production excludes devDependencies (like eslint, prettier)
# --ci is faster and more reliable than 'npm install' for CI/CD
RUN npm ci --only=production && \
    echo "✅ Production dependencies installed"

# ============================================================================
# STAGE 2: Production Runtime
# ============================================================================
# Educational Note: Alpine Linux is a minimal distribution (~5MB base)
# Results in images 60-70% smaller than full Node.js image
FROM node:20-alpine

# Educational Note: Add metadata labels for documentation
LABEL maintainer="STEM Class Project" \
      description="Educational recycling scanner application" \
      version="1.0.0" \
      educational="true"

# Educational Note: Run as non-root user for security
# Alpine node image includes 'node' user (UID 1000) by default
USER node

# Educational Note: Set working directory (owned by node user)
WORKDIR /app

# Educational Note: Copy dependencies from builder stage
# --from=builder references the first stage
# --chown=node:node ensures files are owned by node user
COPY --from=builder --chown=node:node /app/node_modules ./node_modules

# Educational Note: Copy application source code
# This happens AFTER dependencies for better caching
COPY --chown=node:node . .

# Educational Note: Create required directories with correct permissions
# SQLite database and uploads need write access
RUN mkdir -p /app/data && \
    mkdir -p /app/backend/public/uploads && \
    echo "✅ Application directories created"

# Educational Note: Expose port for documentation
# This doesn't actually publish the port, just documents it
EXPOSE 3000

# Educational Note: Health check for Docker and Kubernetes
# Docker/K8s use this to determine if container is healthy
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Educational Note: Default command to start the application
# Can be overridden in docker run or Kubernetes pod spec
CMD ["node", "backend/src/api/server.js"]

# ============================================================================
# Educational Build Instructions:
# ============================================================================
# Build: docker build -t rescan:v1.0.0 .
# Run:   docker run -p 3000:3000 --env-file .env rescan:v1.0.0
# Size:  Check with 'docker images rescan:v1.0.0'
#
# Security Features:
# ✅ Non-root user (node:node)
# ✅ Minimal base image (Alpine Linux)
# ✅ Multi-stage build (no build tools in final image)
# ✅ Health check endpoint
# ============================================================================
