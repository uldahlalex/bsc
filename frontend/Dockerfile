FROM node:16.10-alpine as build-step
RUN mkdir -p /app
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
RUN npm run build --prod

# Step 2: Use build output from 'builder'
FROM nginx:1.20.1
COPY --from=build-step /app/dist/frontend /usr/share/nginx/html
EXPOSE 4200:80
