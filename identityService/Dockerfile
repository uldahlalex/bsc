FROM node:16.2-alpine

# create root application folder
WORKDIR /app

# copy configs to /app folder
COPY package*.json ./
COPY tsconfig.json ./
# copy source code to /app/src folder
COPY . /app

RUN npm install
RUN npm run build

COPY ./inter-service/protos/task-identity.proto ./dist/inter-service/protos/
COPY ./inter-service/protos/delete-saga.proto ./dist/inter-service/protos/

EXPOSE 3002

CMD ["node", "./dist/index.js"]