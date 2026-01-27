FROM node:24-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev
COPY . .
RUN npm run build

FROM node:24-alpine
RUN npm i -g serve
WORKDIR /app
COPY --from=builder /app/dist ./dist
EXPOSE 11000
CMD ["serve", "-s", "dist", "-l", "11000"]
