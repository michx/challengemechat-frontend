FROM node:22-alpine

WORKDIR /app

COPY package.json .

RUN npm install
RUN npm install ssh2
RUN npm install --save-dev @types/ssh2

RUN npm i -g serve

COPY . .


RUN npm run build

EXPOSE 8080

CMD [ "npm", "run", "dev"]