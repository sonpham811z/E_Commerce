# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first for layer caching
COPY package.json package-lock.json ./

RUN npm ci --frozen-lockfile

# Copy the rest of the source
COPY index.html vite.config.js eslint.config.js ./
COPY public ./public
COPY srcs ./srcs

# Build arguments exposed as VITE_ env vars at build time
ARG VITE_AUTH_SERVICE_URL
ARG VITE_CORE_SERVICE_URL
ARG VITE_AI_SERVICE_URL

ENV VITE_AUTH_SERVICE_URL=$VITE_AUTH_SERVICE_URL
ENV VITE_CORE_SERVICE_URL=$VITE_CORE_SERVICE_URL
ENV VITE_AI_SERVICE_URL=$VITE_AI_SERVICE_URL

RUN npm run build

# ─── Stage 2: Serve ───────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config for SPA routing
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/app.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
