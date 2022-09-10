FROM node:16-alpine AS build

RUN apk add --virtual .builddeps vips-dev avahi-dev make g++ git

WORKDIR /usr/src/app

COPY package.json .yarnrc.yml yarn.lock ./
COPY packages/server/package.json ./packages/server/package.json
COPY packages/webui/package.json ./packages/webui/package.json

RUN --mount=type=bind,target=.yarn,source=.yarn,rw=true \
    --mount=type=cache,target=.yarn/cache \
    yarn install --immutable

COPY . .
RUN --mount=type=bind,target=.yarn,source=.yarn PATH=/usr/src/app/node_modules/.bin:$PATH yarn build
RUN yarn run pack

FROM node:16-alpine

RUN apk add avahi avahi-compat-libdns_sd vips ffmpeg
RUN apk add --virtual .builddeps vips-dev avahi-dev make g++

WORKDIR /usr/src/app

RUN --mount=type=bind,target=/build,from=build,source=/usr/src/app \
    cd /build; \
    find . -name 'package.tgz' -mindepth 0 -maxdepth 4 -exec sh -c 'mkdir -p /usr/src/app/`dirname {}` && tar -xzf {} --strip 1 -C /usr/src/app/`dirname {}`' \;

COPY package.json .yarnrc.yml yarn.lock ./
COPY bin ./bin

RUN --mount=type=bind,target=.yarn,source=.yarn,rw=true \
    --mount=type=cache,target=.yarn/cache,from=build,source=/usr/src/app/.yarn/cache \
    yarn workspaces focus --production @pithmediaserver/pith; \
    apk del .builddeps

EXPOSE 3333
VOLUME /media

ENTRYPOINT [ "bin/pith.js" ]
