# Build stage
ARG NODE_VERSION="18.12.1"
ARG ALPINE_VERSION="3.17"

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS builder

# Install OpenSSL 1.1.x for compatibility
RUN apk update && apk add openssl1.1-compat

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for building)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS production

# Install OpenSSL 1.1.x for compatibility
RUN apk update && apk add openssl1.1-compat

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start command - run migrations then start the app
# Note: In production, migrations should be run manually or via CI/CD
# For auto-migration on startup, uncomment the line below (not recommended for production)
CMD ["node", "dist/main"]
