Microservice based webmail client built with ReactJS and Spring.

## Introduction

### A webmail application built with a microservice architecture 

# Features
- No database required
- Quick and easy deployment (docker images and deployment examples available)
- Rich text message editing
- Support for embedded images (paste into editor)
- Recipient addresses autocomplete
- Drag & drop messages
- Drag & drop file attachments
- Drag & drop folders
- Folder create, delete and rename
- Multi language support (English & Spanish)
- Browser notifications

# TODO Features:
- Improve responsive layout for mobile devices
- TDD tests
- Add message search functionality
- Virtual Assistant
- Artificial Intelligence
- Reactive workflow

# Architecture
Currently, Lefebvre IMAP/SMTP consists of only two components, a front-end React application with the user interface and a back-end Spring application that servers as an API to the IMAP and SMTP protocols.

In order to deploy the application, a reverse-proxy / load balancer is required to enable communication between front-end and back-end. This component will also be required to orchestrate the requests and provide the means to elastically scale any of the other components.

Following is a list of some of the technologies and patterns used throughout the application. There will be future dedicated posts about the integration of these technologies with Lefebvre IMAP/SMTP mail client.

## Front-end
The FE is based in ReactJS and is built using Babel 7 and Webpack 4 (Following the technique described in the this post).

One of the main features of Lefebvre IMAP/SMTP mail is that along with the state of the application, the user’s mailbox is partially cached and stored (encrypted) in the browser’s IndexedDB.

These are some of the technologies in use:

**Redux:** The Redux pattern is used throughout the application to manage the application state. On top of this, the state of the application is persisted/recovered in/from the browser’s IndexedDB.
**i18next:** The i18next framework is used for internationalization. Translation are loaded from static JSON application resources.
**Web workers:** web workers are used to perform resource consuming background tasks. Currently there is a web worker for encryption and decryption. Worker-loader module is used to integrate the web worker in the Babel+Webpack build.
**Drag and drop:** Html5 drag and drop is used natively.
**whatwg-fetch:** GitHub’s fetch polyfill is used. Most back-end requests are performed using fetch.
**SJCL (Stanford Javascript Crypto Library):** This library is used for hashing and encrypting user’s sensitive information before persisting it in the browser’s IndexedDB.
**IndexedDB + IDB:** The browser’s IndexedDB is intensively used to cache folder’s messages, application state, etc. The access to the DB is performed using the idb library which replaces some of the native IndexedDB objects with promises.
**TinyMCE:** Version 4 of this rich text editor is used and integrated as a ReactJS component and Redux.
**DOMpurify:** This library is used to sanitize HTML e-mail content before rendering it in a ReacJS component (dangerouslySetInnerHTML)
**Jest + Enzyme:** FE unit tests are written with Jest and the help of Enzyme.
**Notifications:** Html5 notifications are used natively to notify the user about new mail.

## Back-end
The BE is a Spring application built with Gradle.

It simply acts as a web API to expose IMAP and SMTP capabilities to the FE. The application has no state neither database support.

These are some of the technologies in use:

**Spring Boot:** for application bootstrapping.
**Spring HATEOAS:** for resource link building.
**Spring Webflux (Project Reactor):** to create reactive endpoints. Currently folder messages resource is using a Flux endpoint to stream Server-sent events to the browser in order to stream batches of messages as soon as they are retrieved from the IMAP server.
**JavaMail API:** for SMTP and IMAP protocol access.
**JUnit 4 + Mockito 2 + Powermock:** BE unit tests are implemented with JUnit and Mockito 2. Powermock is used to mock static methods and final classes from the JavaMail API.
**Reverse-proxy / load balancer**
For development purposes, Webpack-dev-server is used to proxy requests from the front-end to the API back-end. This same procedure could be used for some specific deployments although it’s not the recommended approach.

There is an example docker-compose deployment showing how easy it is to deploy the application using Traefik and the official Lefebvre IMAP/SMTP docker images.


cd Lefebvre IMAP/SMTP-mail/docker/traefik
docker-compose pull && docker-compose up --force-recreate

Running the previous commands will deploy the application in your localhost.

RUN THE SERVER IN LOCAL- DEV ENVIRONMENT:

cd server/build/libs
$ java -jar api-0.0.1-SNAPSHOT.jar


## Continuous Integration

Lefebvre IMAP/SMTP’s CI is bassed on DevOps Azure pipeline.

## GitHub:
avalverdelefebvre/multichannel
https://github.com/avalverdelefebvre/multichannel.git
user:avalverdelefebvre
password:Alberto1971.-

$ git clone https://github.com/avalverdelefebvre/multichannel


## Docker:

Docker hub: https://hub.docker.com/

### create cert:
```bash
# need to install ssl
# set de general configuration (copy if not exist from solution items)
$ set openssl_conf=c:\openssl\bin\openssl.cfg
# create cert and key
$ openssl req -x509 -newkey rsa:4096 -keyout appname_key.pem -out appname.pem -days 365
# create pfx to export (not necesarry in nginx)
$ openssl pkcs12 -export -out appname.pfx -inkey appname_key.pem -in appname.pem
# copy to root folder of app
# include in project
```
### configure nginx
```bash
# edit conf of docker/nginx/default.conf (create if don´t exist)
server {
	listen 443 ssl;
    server_name     localhost;
	ssl_certificate /etc/nginx/conf.d/appname_client.pem;
    ssl_certificate_key /etc/nginx/conf.d/appname_client_key.pem;
    ssl_password_file /etc/nginx/conf.d/appname_client_key_pass.txt;
...
```

### configure dockerfile

``` yaml
# edit dockerfile
COPY ./appname_client.pem /etc/nginx/conf.d/appname_client.pem
COPY ./appname_client_key.pem /etc/nginx/conf.d/appname_client_key.pem
COPY ./appname_client_key_pass.txt /etc/nginx/conf.d/appname_client_key_pass.txt
COPY ./docker/nginx/default.conf /etc/nginx/conf.d/appname.conf
#  configure port ssl to expose
EXPOSE 443
# optional to evaluate final destination
RUN ls -lha /etc/nginx/conf.d
```

### create image:

``` bash
# clean old images (optional)
$ docker image prune -a
$ docker build . -t imap-smtp.client:pruebas
# To check that run (optional):
$ docker image list
$ docker image inspect id_image
```
### Container run:
``` bash
# option 1:
$ docker run -p 8001:80 imap-smtp.client
$ curl -v -k http://localhost:8001
# or navigate to http://localhost:8001

# option 2:
$ docker run -p 80:80 imap-smtp.client 
$ curl -v -k http://192.168.99.100
# or navigate to http://192.168.99.100 or domain name
```

## Docker Publish

```bash
$ docker login --username=avalverdelefebvre 
Password: Alberto1971.-
# add tag:
$ docker tag image_id elefebvreoncontainers/imap-smtp.client:pruebas
#To upload to docker hub:
$ docker push elefebvreoncontainers/imap-smtp.client
# to dowload local:
$ docker pull elefebvreoncontainers/imap-smtp.client:pruebas
```

## Azure Deployment

```bash
$ sudo docker-compose pull && docker-compose up --force-recreate
# or 
$ sudo docker-compose up
```
