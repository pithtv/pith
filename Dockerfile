FROM node:16-alpine AS build

RUN apk add --virtual .builddeps vips-dev make g++ git

WORKDIR /usr/src/app

COPY package.json .yarnrc.yml yarn.lock ./
COPY .yarn ./.yarn
COPY packages/server/package.json ./packages/server/package.json
COPY packages/webui/package.json ./packages/webui/package.json
COPY packages/api/package.json ./packages/api/package.json

RUN yarn install --immutable

COPY . .
RUN PATH=/usr/src/app/node_modules/.bin:$PATH yarn build
RUN yarn run pack

FROM node:16-alpine

WORKDIR /usr/src/app

COPY package.json .yarnrc.yml yarn.lock ./
COPY bin ./bin

RUN --mount=type=bind,target=/build,from=build,source=/usr/src/app \
    --mount=type=bind,target=/usr/src/app/.yarn,source=/usr/src/app/.yarn,rw=true,from=build \
    apk add vips ffmpeg dbus;\
    apk add --virtual .builddeps vips-dev make g++; \
    cd /build; \
    find . -name 'package.tgz' -mindepth 0 -maxdepth 4 -exec sh -c 'mkdir -p /usr/src/app/`dirname {}` && tar -xzf {} --strip 1 -C /usr/src/app/`dirname {}`' \; ;\
    cd /usr/src/app; \
    yarn workspaces focus --production @pithmediaserver/pith; \
    apk del .builddeps

ENV PITH_DATA_DIR=/data

EXPOSE 3333
VOLUME /media
VOLUME /data

ENTRYPOINT ["node","bin/pith.js"]
