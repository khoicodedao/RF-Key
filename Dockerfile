# =========================
# Stage 1: Build
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files trước để tận dụng cache layer
COPY package*.json ./
RUN npm install

# Copy toàn bộ source code
COPY . .

# Copy file .env vào container để build-time có biến môi trường
COPY .env .env

# Build Next.js production
RUN npm run build


# =========================
# Stage 2: Runtime
# =========================
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy các file cần thiết từ builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.env ./.env

EXPOSE 3000

CMD ["npm", "start"]
