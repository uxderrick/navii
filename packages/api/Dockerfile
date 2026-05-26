# syntax=docker/dockerfile:1.7
#
# Multi-stage build for @usenavii/api.
# Stage 1: install workspace deps + build core/api.
# Stage 2: copy only prod artifacts into a slim runtime.

FROM node:20-bookworm-slim AS build
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /repo

# Copy workspace manifests first for better layer caching
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* tsconfig.base.json ./
COPY packages/core/package.json packages/core/
COPY packages/react/package.json packages/react/
COPY packages/api/package.json packages/api/

# --ignore-scripts skips esbuild's postinstall binary-version check, which has
# flaked across pnpm store boundaries when multiple esbuild major versions are
# present in the lockfile. We don't run esbuild as a CLI binary in the build —
# tsup imports esbuild as a JS module, which works regardless.
RUN pnpm install --frozen-lockfile=false --ignore-scripts

# Now copy sources
COPY packages/core packages/core
COPY packages/api packages/api

RUN pnpm --filter @usenavii/core run build \
 && pnpm --filter @usenavii/api run build

# Produce a deployable bundle directory
RUN pnpm deploy --filter=@usenavii/api --prod /out

# --- runtime image -----------------------------------------------------------
FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production \
    PORT=8787 \
    HOST=0.0.0.0 \
    TRUST_PROXY=1

# Native deps for @resvg/resvg-js (libstdc++ already in slim image; fonts help)
RUN apt-get update \
 && apt-get install -y --no-install-recommends fonts-dejavu-core ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /out /app
COPY packages/api/public /app/public
# /blog renders directly from CHANGELOG.md at request time. dist/blog.js looks
# for the file at ../CHANGELOG.md relative to itself, so place it at /app/.
COPY CHANGELOG.md /app/CHANGELOG.md

# Drop privileges
USER node

EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/healthz').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "dist/server.js"]
