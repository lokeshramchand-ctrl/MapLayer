# ======================
# Stage 1: Build
# ======================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies fresh (no cached native binaries)
RUN npm ci

# Copy source files
COPY . .

# Rebuild esbuild for Alpine (fixes your error)
RUN npm rebuild esbuild

# Build static files
RUN npm run build

# ======================
# Stage 2: Serve with Nginx
# ======================
FROM nginx:alpine

# Copy build output to nginx HTML directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose Nginx port
EXPOSE 80

# Run Nginx
CMD ["nginx", "-g", "daemon off;"]
