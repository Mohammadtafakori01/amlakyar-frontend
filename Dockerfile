# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application with static export (output: 'export' when NODE_ENV=production)
# The build will create static files in the 'out' directory
ENV NODE_ENV=production
RUN npm run build

# Production stage - use a lightweight static file server
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install serve package globally to serve static files
RUN npm install -g serve@latest

# Copy the static export output from builder
COPY --from=builder /app/out ./out
COPY --from=builder /app/package*.json ./

# Expose port 3000
EXPOSE 3000

# Start static file server
# -s flag means single-page application mode (serves index.html for all routes)
# -l 3000 means listen on port 3000
CMD ["serve", "-s", "out", "-l", "3000"]

