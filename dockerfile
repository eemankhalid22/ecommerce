FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000
ENV PORT=5000 \
    DB_HOST=localhost \
    DB_USER=root \
    DB_PASS=root \
    DB_NAME=ecommerce \
    SESSION_SECRET=change_me

CMD ["npm", "start"]