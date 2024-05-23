FROM node:20.10.0

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ENTRYPOINT [ "node", "index.js" ]