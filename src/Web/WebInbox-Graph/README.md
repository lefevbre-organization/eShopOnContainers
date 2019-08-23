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

to create image:
$ docker build . -t react-graph-docker

To check that run:
$ docker images

Container run:
$ docker run -p 8001:80 react-graph-docker and navigate to http://localhost:8001

or

$ docker run -p 80:80 react-graph-docker and navigate to 192.168.99.100 or domain name

## Docker Publish

$ docker login --username=avalverdelefebvre 
Password: Alberto1971.-

to add tag:
$ docker tag xxxxxxxxxx yourhubusername/react-office365-docker:firsttry

To upload to docker hub:
$ docker push avalverdelefebvre/react-office365-docker

to dowload local:
$ docker pull avalverdelefebvre/react-office365-docker:firsttry


## Azure Deployment

run `$ npm run build`

- Create zip with "build" folder

- Upload (zip) to:  https://lefebvre-multichannel-inbox-graph.scm.azurewebsites.net/ZipDeployUI

The release is available here:
https://lefebvre-multichannel-inbox-graph.azurewebsites.net