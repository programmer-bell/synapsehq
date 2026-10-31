# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-bookworm-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build \
    JWT_SECRET=build-only-secret-that-is-at-least-32-characters \
    NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL} \
    AUTH_SESSION_TTL_SECONDS=604800
RUN npm run build

FROM base AS production
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./next.config.ts
USER nextjs
EXPOSE 3000
CMD ["npm", "run", "start"]
