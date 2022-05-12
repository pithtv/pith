FROM node:16
WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y libavahi-compat-libdnssd-dev libvips-dev

COPY package*.json ./
COPY webui/package*.json ./webui/
RUN npm install
RUN npm install --prefix ./webui

COPY . .

RUN npm run build

EXPOSE 3333

CMD [ "node", "built/app.js" ]
