FROM node:24-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
ENV PORT=11001
EXPOSE 11001
CMD ["node", "server.js"]
