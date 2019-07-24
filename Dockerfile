
FROM 'node:12-alpine'
ENV NODE_ENV production

RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

EXPOSE 80
EXPOSE 443

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm i --no-optional -P

COPY . .

# This was commented to work on Windows (might be a bad idea)
# USER load-m-up

CMD ["node", "./bin/load-m-up.js"]
