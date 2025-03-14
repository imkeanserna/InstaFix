# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install OpenSSL for Prisma - use specific package to ensure compatibility
RUN apk add --no-cache openssl openssl-dev libc6-compat

# Install pnpm
RUN npm install -g pnpm

# Copy only package files first to leverage Docker cache
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/db/package.json ./packages/db/
COPY packages/types/package.json ./packages/types/
COPY apps/socket-server/package.json ./apps/socket-server/

# Install all dependencies for build
RUN pnpm install --frozen-lockfile

# Copy source files
COPY packages/typescript-config ./packages/typescript-config
COPY packages/db ./packages/db
COPY packages/types ./packages/types
COPY apps/socket-server ./apps/socket-server

# Generate Prisma client - with explicit schema path
WORKDIR /app/packages/db
RUN npx prisma generate --schema=./prisma/schema.prisma

# Verify Prisma client was generated
RUN ls -la node_modules/.prisma || echo "Prisma client not generated"

# Build the socket-server
WORKDIR /app/apps/socket-server
RUN pnpm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl libc6-compat

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/db/package.json ./packages/db/
COPY packages/types/package.json ./packages/types/
COPY apps/socket-server/package.json ./apps/socket-server/

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built files 
COPY --from=builder /app/packages/db/prisma ./packages/db/prisma

# Copy the entire db package including generated client
COPY --from=builder /app/packages/db/node_modules ./packages/db/node_modules
COPY --from=builder /app/apps/socket-server/dist ./apps/socket-server/dist

# Set working directory
WORKDIR /app/apps/socket-server

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "dist/index.js"]
