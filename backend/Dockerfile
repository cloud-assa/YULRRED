FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
# Install all deps (including dev — needed for ts-node, nest build)
RUN npm ci

COPY . .

# Build NestJS
RUN npm run build

EXPOSE 4000
CMD ["node", "dist/main"]
