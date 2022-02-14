FROM node:16.2-alpine

# create root application folder
WORKDIR /app

# copy configs to /app folder
COPY package*.json ./
COPY tsconfig.json ./
# copy source code to /app/src folder
COPY . /app
#RUN npm i -g prisma
#RUN prisma migrate dev --name init
RUN npm install
RUN npm run build


CMD ["node", "./dist/index.js"]