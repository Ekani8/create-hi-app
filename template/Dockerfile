FROM node:24-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 HUSKY=0
FROM base AS builder
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
RUN npm run db:generate && DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build npm run build
FROM base AS runner
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
CMD ["node", "server.js"]
