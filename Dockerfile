# Monolith image: builds React client and serves it via Express backend

# 1) Build client
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --no-audit --no-fund
COPY client/ .
RUN npm run build

# 2) Build server runtime
FROM node:20-alpine AS server
WORKDIR /app

# Install production deps first for better layer caching
COPY server/package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

# Copy server source
COPY server/ .

# Copy client build into server public directory
RUN mkdir -p public && adduser -D -H appuser
COPY --from=client-build /app/client/build ./public
RUN find . -type d -name "test" -prune -exec rm -rf {} + 2>/dev/null || true \
	&& rm -rf **/*.md || true

ENV NODE_ENV=production \
	PORT=5000
USER appuser
EXPOSE 5000

CMD ["node", "server.js"]
