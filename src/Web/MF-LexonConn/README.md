
A Microfrontend React web app lexon-connector.
 
### Features:  

### TODO Features:

## Continuous Integration

Lefebvre Lexon-connector app CI is bassed on DevOps Azure pipeline.

## Docker

to create image:
$ docker build . -t react-lexon-connector-docker

To check that run:
$ docker images

Container run:
$ docker run -p 8001:80 react-lexon-connector-docker and navigate to http://localhost:8001

or

$ docker run -p 80:80 react-lexon-connector-docker and navigate to 192.168.99.100 or domain name

## Docker Publish

$ docker login --username=avalverdelefebvre 
Password: Alberto1971.-

to add tag:
$ docker tag xxxxxxxxxx yourhubusername/react-lexonconnector-docker:firsttry

To upload to docker hub:
$ docker push avalverdelefebvre/react-lexon-connector-docker

to dowload local:
$ docker pull avalverdelefebvre/react-lexon-connector-docker:firsttry


## Azure Deployment

run `$ npm run build`

- Create zip with "build" folder

- Upload (zip) to:  https://lefebvre-multichannel-inbox-lexonconnector.scm.azurewebsites.net/ZipDeployUI

The release is available here:
https://lefebvre-multichannel-inbox-lexonconnector.azurewebsites.net