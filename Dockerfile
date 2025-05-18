FROM node:22-alpine AS builder

WORKDIR /build

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine AS production

# Tạo thư mục app và gán quyền cho user node
WORKDIR /app

# Copy chỉ những file cần thiết từ stage build
COPY --chown=node:node --from=builder /build/package*.json ./
COPY --chown=node:node --from=builder /build/dist ./dist

# Install production dependencies only - không sử dụng --ignore-scripts để bcrypt có thể biên dịch
RUN npm ci --omit=dev

# Chuyển sang user node để tăng tính bảo mật
USER node

# Set environment variables
ENV NODE_ENV=production

# Expose the application port
EXPOSE 3333

# Start the application
CMD ["node", "dist/main.js"] 