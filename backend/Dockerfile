FROM node:20-alpine AS backend-build

WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY src ./src

FROM node:20-alpine

WORKDIR /app
COPY --from=backend-build /app/node_modules ./node_modules
COPY --from=backend-build /app/src ./src

RUN mkdir -p data

EXPOSE 3002

CMD ["node", "src/index.js"]
