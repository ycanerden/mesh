# Simple Bun Dockerfile for Mesh
FROM oven/bun:1.3.11
WORKDIR /app

# Copy lockfile and package.json
COPY bun.lock package.json ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the app
COPY . .

# Set env
ENV PORT=8080
ENV NODE_ENV=production

# Expose port
EXPOSE 8080

# Start the server
CMD ["bun", "run", "src/index.ts"]
