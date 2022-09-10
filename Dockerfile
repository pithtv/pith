FROM node:16-alpine AS build

RUN apk add --virtual .builddeps vips-dev avahi-dev make g++ git

WORKDIR /usr/src/app

COPY package.json .yarnrc.yml yarn.lock ./
COPY .yarn ./.yarn
COPY packages/server/package.json ./packages/server/package.json
COPY packages/webui/package.json ./packages/webui/package.json

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
    apk add avahi avahi-compat-libdns_sd vips ffmpeg dbus;\
    apk add --virtual .builddeps vips-dev avahi-dev make g++; \
    cd /build; \
    find . -name 'package.tgz' -mindepth 0 -maxdepth 4 -exec sh -c 'mkdir -p /usr/src/app/`dirname {}` && tar -xzf {} --strip 1 -C /usr/src/app/`dirname {}`' \; ;\
    cd /usr/src/app; \
    yarn workspaces focus --production @pithmediaserver/pith; \
    apk del .builddeps ; \
    echo '#!/bin/sh' > startup.sh ; \
    echo 'dbus-daemon --system' >> startup.sh ; \
    echo 'avahi-daemon --no-chroot &' >> startup.sh ; \
    echo 'node bin/pith.js "$@"' >> startup.sh

ENV PITH_DATA_DIR=/data

EXPOSE 3333
VOLUME /media
VOLUME /data

ENTRYPOINT ["sh","startup.sh"]
