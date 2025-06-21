# --------- Build Stage ---------
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --------- Production Stage ---------
FROM node:22-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

# Copy built code & dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

USER node

EXPOSE 3333

CMD ["node", "dist/main.js"]
  