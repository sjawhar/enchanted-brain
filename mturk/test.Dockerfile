FROM lambci/lambda:build-nodejs10.x as builder
WORKDIR /scratch
COPY app/package.json app/package-lock.json ./
RUN npm ci

FROM lambci/lambda:nodejs10.x
USER root
WORKDIR /var/task
COPY --from=builder /scratch .
COPY app .

ENTRYPOINT [""]
CMD ["npm", "test"]
