# Node setup
FROM node:alpine AS build
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install -g @angular/cli
RUN npm install
RUN npm run build -c=production

# httpd server
FROM httpd:alpine
FROM httpd:2.4
COPY --from=build /usr/src/app/dist/bitbucket-dashboard/browser /usr/local/apache2/htdocs/
EXPOSE 80
