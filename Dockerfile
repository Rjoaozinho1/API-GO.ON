FROM node:20-alpine AS buildcontainer

RUN ["mkdir", "/app"]

WORKDIR /app

COPY package.json /app

RUN ["npm", "install"]

COPY . .

EXPOSE 5000

CMD ["node", "index.js"]