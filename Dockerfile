FROM node:16-alpine AS build
WORKDIR /usr/src/app

COPY package*.json ./
COPY webui/package*.json ./webui/
COPY . .

RUN apk add --virtual .builddeps vips-dev avahi-dev make g++ \
    && npm ci \
    && npm ci --prefix ./webui \
    && npm run build \
    && npm ci --only production \
    && apk del .builddeps

FROM node:16-alpine

RUN apk add avahi avahi-compat-libdns_sd vips

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/bin ./bin
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/built ./built
COPY --from=build /usr/src/app/resources ./resources
COPY --from=build /usr/src/app/icons ./icons
COPY --from=build /usr/src/app/package.json ./package.json
COPY --from=build /usr/src/app/webui/dist ./webui/dist

EXPOSE 3333
VOLUME /media

ENTRYPOINT [ "node", "built/app.js" ]
