FROM node:20-alpine AS base

RUN npm install -g pnpm@9

WORKDIR /app

# Copy workspace manifests for install layer caching
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/config/package.json   ./packages/config/
COPY packages/db/package.json       ./packages/db/
COPY packages/shared/package.json   ./packages/shared/
COPY apps/api/package.json          ./apps/api/

RUN pnpm install --frozen-lockfile

# Copy all source
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Generate Prisma client
RUN pnpm --filter @resell/db exec prisma generate

EXPOSE 4000

CMD ["pnpm", "--filter", "@resell/api", "exec", "tsx", "src/index.ts"]
