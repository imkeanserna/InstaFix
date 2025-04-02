# Use Node.js LTS as the base image
FROM node:20-alpine AS base

# Install dependencies needed for Prisma and pnpm
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable

# Set working directory
WORKDIR /app

# Setup for build dependencies
FROM base AS builder

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy package files for monorepo setup
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/db/package.json ./packages/db/
COPY packages/store/package.json ./packages/store/
COPY packages/types/package.json ./packages/types/
COPY packages/services/package.json ./packages/services/
COPY packages/ui/package.json ./packages/ui/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application code
COPY . .

# Generate Prisma client without the engine for smaller build
RUN cd apps/web && pnpm db:no-engine

# Build the application
RUN cd apps/web && pnpm build

# Production image
FROM base AS runner

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Expose the port the app will run on
EXPOSE 3000

# Set the command to run the app
CMD ["node", "apps/web/server.js"]
