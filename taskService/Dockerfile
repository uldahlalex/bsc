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

#EXPOSE 3001

CMD ["node", "./dist/index.js", "--port=2345"]