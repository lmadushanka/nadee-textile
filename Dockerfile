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
# GCS credentials (pick one):
# 1) Put `src/lib/amplified-vine-462115-g9-2cc994038afc.json` in the build context (private
#    image builds only — do not commit). `postbuild` + Dockerfile copy it into standalone
#    and `/app/credentials/gcs-sa.json`. Env: GOOGLE_CLOUD_KEY_FILE=/app/credentials/gcs-sa.json
# 2) Prefer: Cloud Run runtime SA + bucket IAM (unset GOOGLE_CLOUD_KEY_FILE), or
#    Secret Manager → GOOGLE_CLOUD_CREDENTIALS_JSON.
FROM base AS builder
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
# Re-copy after build: postbuild also copies into .next/standalone; this keeps /app/credentials for runner COPY.
RUN mkdir -p /app/credentials /app/.next/standalone/credentials && \
    if [ -f "src/lib/amplified-vine-462115-g9-2cc994038afc.json" ]; then \
      cp "src/lib/amplified-vine-462115-g9-2cc994038afc.json" /app/credentials/gcs-sa.json && \
      cp "src/lib/amplified-vine-462115-g9-2cc994038afc.json" /app/.next/standalone/credentials/gcs-sa.json; \
    elif [ -f ".next/standalone/credentials/gcs-sa.json" ]; then \
      cp ".next/standalone/credentials/gcs-sa.json" /app/credentials/gcs-sa.json; \
    fi

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
# When credentials file is baked into the image; override or clear for ADC-only deploys.
ENV GOOGLE_CLOUD_KEY_FILE=/app/credentials/gcs-sa.json

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/credentials ./credentials

USER nextjs
EXPOSE 8080
CMD ["node", "server.js"]
