A Microfrontend React web app for Micrososft Graph management.

Utilizing live data from a RESTful API by using React development tools. It can be useful as a starting point for the new Lefevbre Microservices architecture.

**How does it work?**  
The account sign-in and authentication process is **totally managed by Microsoft secure protocols**.  The workflow is as follows:

 - First-time users will see a landing page with a button to sign in to
   Microsoft.
 - Once successfully signed-in, Microsoft will display a screen asking the
   user for permission to use the account in the application.
  - After permission is granted, the application will load all account data and display the Inbox folder.

**IMPORTANT:** The application does **NOT** store or persist any account or user data in any way at all. It simply fetches data from Microsoft API and displays it in the browser.
**IMPORTANT:** [Microsoft API Usage Limits](https://docs.microsoft.com/es-es/graph/throttling)

**Requirements:**  

- All Microsoft Graph API requests require an ***API Key*** and an ***OAuth 2.0 Client ID***. Follow [these instructions](https://apps.dev.microsoft.com/) to obtain those credentials. Then, store those two values in the ***[.config]

	module.exports = {
    appId: '0803434b-369f-4e1f-973b-85aa480dcf16',
    scopes: [
        'user.read',
        'calendars.read',
        'mail.read',
        'mail.readwrite',
        'mail.send'
    ]
};
 
### Features:

- Responsive Viewport (with Bootstrap and CSS3 flexbox styling)

- Read, Send, Reply, Move to Trash.
- File attached compatibility
- Add message search functionality
  

### TODO Features:

- [ ] Caching / memoizing fetched data 

- [ ] Add support for push notifications

- [ ] Improve responsive layout for mobile devices

- [ ] TDD tests

- [ ] Display message label markers

- [ ] Add message forwarding functionality

- [x] Improve the message search functionality

- [ ] Add hover action buttons for each message in list view

- [ ] Add support for sending message attachments

- [ ] Add support for label create/edit

- [ ] Add support for changing message labels

- [ ] Add advanced WYSIWYG text editor

- [ ] Move / Drag & Drop messages into folders/labels

- [ ] Add support for theming

- [ ] Add support for localization


## Continuous Integration

Lefebvre Office365 app CI is bassed on DevOps Azure pipeline.

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
$ docker build . -t outlook.client:pruebas
# To check that run (optional):
$ docker image list
$ docker image inspect id_image
```
### Container run:
``` bash
# option 1:
$ docker run -p 8001:80 outlook.client
$ curl -v -k http://localhost:8001
# or navigate to http://localhost:8001

# option 2:
$ docker run -p 80:80 outlook.client 
$ curl -v -k http://192.168.99.100
# or navigate to http://192.168.99.100 or domain name
```

## Docker Publish

```bash
$ docker login --username=avalverdelefebvre 
Password: Alberto1971.-
# add tag:
$ docker tag image_id elefebvreoncontainers/outlook.client:pruebas
#To upload to docker hub:
$ docker push elefebvreoncontainers/outlook.client
# to dowload local:
$ docker pull elefebvreoncontainers/outlook.client:pruebas
```

## Azure Deployment

```bash
# 1. run
$ npm run build`

# 2. Create zip with "build" folder

# 3. Upload (zip) to:  https://lefebvre-multichannel-inbox-graph.scm.azurewebsites.net/ZipDeployUI
```

The release is available here:
https://lefebvre-multichannel-inbox-graph.azurewebsites.net