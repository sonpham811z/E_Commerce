FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# ---- final stage ----
FROM node:20-alpine
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY . .


RUN mkdir -p /app/logs && chmod -R 777 /app/logs

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3002/health || exit 1

CMD ["node", "src/app.js"]