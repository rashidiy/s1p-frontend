# Multi-stage build for Next.js application

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Accept build-time env vars (NEXT_PUBLIC_* are baked into the bundle)
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_OWNER_SUBDOMAIN
ARG NEXT_PUBLIC_BASE_DOMAIN

# Build the application
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]

# Stage 4: Development
FROM node:20-alpine AS dev
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
CMD ["npm", "run", "dev"]
