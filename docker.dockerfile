# Node setup
FROM node:alpine AS build
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install -g @angular/cli
RUN npm install
RUN npm run build

# httpd server
FROM httpd:alpine
FROM httpd:2.4
COPY --from=build dist/browser/ /usr/local/apache2/htdocs/
EXPOSE 8080
