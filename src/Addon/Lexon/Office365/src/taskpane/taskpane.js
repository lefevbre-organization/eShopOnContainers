/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global document, Office, require */

const OfficeHelpers = require("@microsoft/office-js-helpers");

Office.initialize = () => {
  if (OfficeHelpers.Authenticator.isAuthDialog()) {
    return;
 }

  Office.onReady(info => {
    if (info.host === Office.HostType.Outlook) {
      var authenticator = new OfficeHelpers.Authenticator();
      // authenticator.endpoints.registerGoogleAuth('835159453859-mrrokdm9qdihjlv6f117k999qe8kvito.apps.googleusercontent.com');
      authenticator.endpoints.registerGoogleAuth('835159453859-mrrokdm9qdihjlv6f117k999qe8kvito.apps.googleusercontent.com', { 
        clientId: '835159453859-mrrokdm9qdihjlv6f117k999qe8kvito.apps.googleusercontent.com',
        baseUrl: 'https://localhost:3000',
        tokenUrl: 'https://8ed4037c.ngrok.io/token',
        redirectUrl: 'https://localhost:3020/taskpane.html',
        authorizeUrl: '/login',
        scope: 'data:read',
        responseType: 'code',
        state: true
      });
     
      const authenticate = () => {
        authenticator.authenticate(OfficeHelpers.DefaultEndpoints.Google, true)
        .then(function(token) {
          console.log(token)
        })
        .catch(OfficeHelpers.Utilities.log);
       };
     
      document.getElementById("getGraphDataButton").onclick = authenticate;
    }
  });
   
  // document.getElementById("getGraphDataButton").onclick = authenticate;
}
