FROM node:12 AS builder
WORKDIR /source
COPY app/package.json app/package-lock.json ./
RUN npm ci

FROM node:12-alpine
WORKDIR /app
COPY --from=builder /source .
COPY app/src ./src
COPY entrypoint.sh app/app.json app/babel.config.js ./
RUN mkdir .expo \
 && touch .env \
 && chown node:node .expo .env

USER node
ENTRYPOINT ["./entrypoint.sh"]
