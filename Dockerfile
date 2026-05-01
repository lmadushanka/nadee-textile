# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

# .env.local is not copied (.dockerignore). Set AUTH_SECRET, MONGODB_URI, PROJECT_ID,
# BUCKET_NAME on Cloud Run.
#
# GCS: standalone output does not include src/. If `src/lib/amplified-vine-462115-g9-2cc994038afc.json`
# exists in the build context (local/private builds), it is copied to /app/credentials/gcs-sa.json.
# Then set Cloud Run env: GOOGLE_CLOUD_KEY_FILE=/app/credentials/gcs-sa.json
# Prefer Secret Manager (GOOGLE_CLOUD_CREDENTIALS_JSON) or bucket IAM + runtime SA for shared CI images.
FROM base AS builder
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p /app/credentials && \
    if [ -f "src/lib/amplified-vine-462115-g9-2cc994038afc.json" ]; then \
      cp "src/lib/amplified-vine-462115-g9-2cc994038afc.json" /app/credentials/gcs-sa.json; \
    fi
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
# Used when credentials/gcs-sa.json was copied from src/lib/… during build; override via Secret Manager JSON if needed.
ENV GOOGLE_CLOUD_KEY_FILE=/app/credentials/gcs-sa.json

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/credentials ./credentials

USER nextjs
EXPOSE 8080
CMD ["node", "server.js"]
