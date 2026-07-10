# ---- Build stage ----
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build app
RUN npm run build


# ---- Runtime stage ----
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy only needed files from build stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

CMD ["node", "dist/app.js"]