# --- Builder stage ---
FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts || npm install
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
COPY public ./public
RUN npx prisma generate
RUN npm run build

# --- Runtime stage ---
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs appuser
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=appuser:nodejs /app/public ./public
COPY --chown=appuser:nodejs src/database/prisma ./src/database/prisma
COPY --chown=appuser:nodejs package.json ./
RUN mkdir -p uploads && chown appuser:nodejs uploads
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); })" || exit 1
CMD ["node", "dist/main.js"]
