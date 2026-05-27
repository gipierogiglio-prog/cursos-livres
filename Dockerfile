FROM node:20-alpine AS backend
WORKDIR /app/backend
COPY backend/package.json ./
RUN npm install --production
COPY backend/src ./src
RUN mkdir -p data

FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npx vite build

FROM node:20-alpine
WORKDIR /app
COPY --from=backend /app/backend ./backend
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

RUN npm install -g serve

EXPOSE 3002
EXPOSE 5173

CMD sh -c "node backend/src/index.js & serve -s frontend/dist -l 5173 --cors & wait"
