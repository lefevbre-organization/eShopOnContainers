A Microfrontend React web app for google Gmail management.

Utilizing live data from a RESTful API by using React development tools. It can be useful as a starting point for the new Lefevbre Microservices architecture.

**How does it work?**  
The account sign-in and authentication process is **totally managed by Gmail's secure protocols**.  The workflow is as follows:

 - First-time users will see a landing page with a button to sign in to
   Gmail.
 - Once successfully signed-in, Gmail will display a screen asking the
   user for permission to use the account in the application.
  - After permission is granted, the application will load all account data and display the Inbox folder.

**IMPORTANT:** The application does **NOT** store or persist any account or user data in any way at all. It simply fetches data from Gmail's API and displays it in the browser.
**IMPORTANT:** [Gmail API Usage Limits](https://developers.google.com/gmail/api/v1/reference/quota)

**Requirements:**  

- All Gmail API requests require an ***API Key*** and an ***OAuth 2.0 Client ID***. Follow [these instructions](https://developers.google.com/fit/android/get-api-key) to obtain those credentials. Then, store those two values in the ***[.env](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables)*** file located in the root folder by replacing `<YOUR_API_KEY>` and `<YOUR_CLIENT_ID>` respectively.
- API console: https://console.developers.google.com

### Features:

- Responsive Viewport (with Bootstrap and CSS3 flexbox styling)

- Read, Send, Reply, Move to Trash.
- File attached compatibility
- Add message search functionality
  

### TODO Features:

- [ ] Caching / memoizing fetched data (important due to [Gmail API Usage Limits](https://developers.google.com/gmail/api/v1/reference/quota))

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

Lefebvre Google inbox app CI is bassed on DevOps Azure pipeline.

## Docker:

to create image:
$ docker build . -t google.docker

To check that run:
$ docker images

Container run:
$ docker run -p 8001:80 react-google-docker and navigate to http://localhost:8001

or

$ docker run -p 80:80 react-google-docker and navigate to 192.168.99.100 or domain name

## Docker Publish:

$ docker login --username=avalverdelefebvre 
Password: Alberto1971.-

to add tag:
$ docker tag xxxxxxxxxx elefebvreoncontainers/google.client:latest

To upload to docker hub:
$ docker push elefebvreoncontainers/google.client

to dowload local:
$ docker pull elefebvreoncontainers/google.client:latest

To remove all images
docker system prune -a

## Azure Deployment

run `$ npm run build`

- Create zip with "build" folder

- Upload (zip) to:  https://lefebvre-multichannel-inbox-google.scm.azurewebsites.net/ZipDeployUI

The release is available here:
https://lefebvre-multichannel-inbox-google.azurewebsites.net
