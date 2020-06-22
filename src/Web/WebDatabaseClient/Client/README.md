
A Microfrontend React web app lexon-connector.
 
### Features:  

### TODO Features:

## Continuous Integration

Lefebvre Lexon-connector app CI is bassed on DevOps Azure pipeline.

## Docker

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
$ docker build . -t lexon.client:pruebas
# To check that run (optional):
$ docker image list
$ docker image inspect id_image
```
### Container run:
``` bash
# option 1:
$ docker run -p 8001:80 lexon.client
$ curl -v -k http://localhost:8001
# or navigate to http://localhost:8001

# option 2:
$ docker run -p 80:80 lexon.client 
$ curl -v -k http://192.168.99.100
# or navigate to http://192.168.99.100 or domain name
```

## Docker Publish

```bash
$ docker login --username=avalverdelefebvre 
Password: Alberto1971.-
# add tag:
$ docker tag image_id elefebvreoncontainers/lexon.client:pruebas
#To upload to docker hub:
$ docker push elefebvreoncontainers/lexon.client
# to dowload local:
$ docker pull elefebvreoncontainers/lexon.client:pruebas
```

## Azure Deployment

```bash
# 1. run
$ npm run build`

# 2. Create zip with "build" folder

# 3. Upload (zip) to:  https://lefebvre-multichannel-inbox-lexonconnector.scm.azurewebsites.net/ZipDeployUI
```

The release is available here:
https://lefebvre-multichannel-inbox-lexonconnector.azurewebsites.net