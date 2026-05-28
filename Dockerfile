FROM node:20-alpine

WORKDIR /app

COPY backend/package.json ./
RUN npm install --production

COPY backend/src ./src
COPY backend/public ./public

RUN mkdir -p /app/data

EXPOSE 3002

CMD ["node", "src/index.js"]
