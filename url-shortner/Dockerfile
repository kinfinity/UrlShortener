# use lightweight base image
FROM node:19.7.0 as base
# Install necessary packages
RUN apt-get update && \
    apt-get install -y awscli && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app
RUN pwd

COPY package.json .
COPY tsconfig*.json .
COPY src src

RUN npm install
RUN npm run build

FROM node:19.7.0 as final
COPY --from=base /usr/src/app/dist .
COPY --from=base /usr/src/app/package.json .

EXPOSE 3000
ENTRYPOINT [ "npm", "start" ]
