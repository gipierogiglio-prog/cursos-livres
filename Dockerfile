FROM node:20-alpine AS builder

WORKDIR /app

# Build frontend
COPY frontend/package.json ./frontend/
RUN cd frontend && npm install
COPY frontend/ ./frontend/
RUN cd frontend && npx vite build

# Prepare backend
COPY backend/package.json ./backend/
RUN cd backend && npm install

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/src ./backend/src
COPY --from=builder /app/frontend/dist ./backend/public
COPY --from=builder /app/backend/package.json ./backend/

RUN mkdir -p /app/backend/data

EXPOSE 3002

CMD ["node", "backend/src/index.js"]
