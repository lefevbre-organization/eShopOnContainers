This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

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
$ docker build . -t portal.client:pruebas
# To check that run (optional):
$ docker image list
$ docker image inspect id_image
```
### Container run:
``` bash
# option 1:
$ docker run -p 8001:80 portal.client
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
$ docker tag image_id elefebvreoncontainers/portal.client:pruebas
#To upload to docker hub:
$ docker push elefebvreoncontainers/portal.client
# to dowload local:
$ docker pull elefebvreoncontainers/portal.client:pruebas
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

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
