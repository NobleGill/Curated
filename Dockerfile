# ============================================================================
# Stage 1: Install dependencies
# ============================================================================
FROM node:20-slim AS deps

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace config files first for better caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY tsconfig.base.json tsconfig.json ./

# Copy all package.json files from workspace packages
COPY artifacts/api-server/package.json artifacts/api-server/package.json
COPY artifacts/closet/package.json artifacts/closet/package.json
COPY lib/api-client-react/package.json lib/api-client-react/package.json
COPY lib/api-spec/package.json lib/api-spec/package.json
COPY lib/api-zod/package.json lib/api-zod/package.json
COPY lib/db/package.json lib/db/package.json
COPY lib/integrations-openai-ai-server/package.json lib/integrations-openai-ai-server/package.json
COPY lib/object-storage-web/package.json lib/object-storage-web/package.json
COPY scripts/package.json scripts/package.json

# Install all dependencies
# --no-frozen-lockfile: the lockfile was generated on Windows with win32-specific
# optional native bindings. On Linux (Docker), pnpm resolves the linux-x64 variants
# instead, which changes the lockfile. This is safe and expected.
RUN pnpm install --no-frozen-lockfile

# ============================================================================
# Stage 2: Build everything
# ============================================================================
FROM node:20-slim AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy everything from deps (includes node_modules at all levels)
COPY --from=deps /app ./

# Copy all source code
COPY . .

# Build-time env vars needed by Vite (baked into the frontend bundle)
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

# Build the frontend (Vite) — outputs to artifacts/closet/dist/public
RUN pnpm --filter @workspace/closet run build

# Build the API server (esbuild) — outputs to artifacts/api-server/dist
RUN pnpm --filter @workspace/api-server run build

# ============================================================================
# Stage 3: Production image
# ============================================================================
FROM node:20-slim AS production

WORKDIR /app

# Copy the built API server bundle
COPY --from=builder /app/artifacts/api-server/dist ./artifacts/api-server/dist

# Copy the built frontend static files
COPY --from=builder /app/artifacts/closet/dist/public ./artifacts/closet/dist/public

# Copy root node_modules for any runtime deps needed by externalized packages
# (e.g. @google-cloud/storage and other packages marked as external in esbuild)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/artifacts/api-server/node_modules ./artifacts/api-server/node_modules
COPY --from=deps /app/lib/db/node_modules ./lib/db/node_modules

# Copy package files needed at runtime
COPY package.json ./
COPY artifacts/api-server/package.json ./artifacts/api-server/

# Expose the port Render will use
EXPOSE 10000

ENV NODE_ENV=production
ENV PORT=10000

# Start the API server
CMD ["node", "--enable-source-maps", "./artifacts/api-server/dist/index.mjs"]
