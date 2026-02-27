# # Multi-stage build for optimized image size

# # Stage 1: Build
# FROM node:24-alpine AS builder

# # Set working directory
# WORKDIR /app

# # Copy package files
# COPY package*.json ./
# COPY prisma ./prisma/

# # Install dependencies
# RUN npm ci

# # Copy source code
# COPY . .

# # Generate Prisma Client
# RUN npx prisma generate

# # Build TypeScript
# RUN npm run build

# # Stage 2: Production
# FROM node:24-alpine AS production

# # Install dumb-init for proper signal handling
# RUN apk add --no-cache dumb-init

# # Create non-root user
# RUN addgroup -g 1001 -S nodejs && \
#     adduser -S nodejs -u 1001

# # Set working directory
# WORKDIR /app

# # Copy package files
# COPY package*.json ./

# # Install production dependencies only
# RUN npm ci --only=production && \
#     npm cache clean --force

# # Copy Prisma schema and migrations
# COPY --chown=nodejs:nodejs prisma ./prisma/
# COPY --chown=nodejs:nodejs prisma.config.ts ./
# # Copy built application from builder
# COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
# COPY --from=builder --chown=nodejs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# COPY --from=builder --chown=nodejs:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client
# # Switch to non-root user
# USER nodejs

# # Expose port
# EXPOSE 3000

# # Health check
# HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
#     CMD node -e "require('http').get('http://localhost:3000/api/events', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# # Use dumb-init to handle signals properly
# ENTRYPOINT ["dumb-init", "--"]

# # Start application
# CMD ["node", "dist/index.js"]


# Multi-stage build for optimized image size

# Stage 1: Build
FROM node:24-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (use package.json, not lockfile)
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate 

# Build TypeScript
RUN npm run build


# Stage 2: Production
FROM node:24-alpine AS production

# Install dumb-init for proper signal handling
RUN apt-get update && \
    apt-get install -y --no-install-recommends dumb-init && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files and Prisma configs
COPY package*.json ./
COPY --chown=nodejs:nodejs prisma ./prisma/
COPY --chown=nodejs:nodejs prisma.config.ts ./

# THE CHEAT CODE: Copy the completely built node_modules and compiled code
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/src ./src
# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4000/api/events', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/index.js"]