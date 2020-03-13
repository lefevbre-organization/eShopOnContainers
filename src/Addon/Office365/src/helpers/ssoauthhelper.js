/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global OfficeRuntime, require */

const documentHelper = require("./documentHelper");
const fallbackAuthHelper = require("./fallbackAuthHelper");
const sso = require("office-addin-sso");
let retryGetAccessToken = 0;

export async function getGraphData() {
  try {
    let bootstrapToken = await OfficeRuntime.auth.getAccessToken({ allowSignInPrompt: true, forceAddAccount: true});
    let exchangeResponse = await getGraphToken(bootstrapToken);
    console.log('exchangeResponse', exchangeResponse);
    if (exchangeResponse.claims) {
      let mfaBootstrapToken = await OfficeRuntime.auth.getAccessToken({ authChallenge: exchangeResponse.claims });
      exchangeResponse = await getGraphToken(mfaBootstrapToken);
   }
  
   if (exchangeResponse.error) {
       handleAADErrors(exchangeResponse);
   } 
   else {
       makeGraphApiCall(exchangeResponse.access_token);
   }
  
  } catch (exception) {
    if (exception.code) { 
      handleClientSideErrors(exception);
    }
    else {
      sso.showMessage("EXCEPTION: " + JSON.stringify(exception));
    }
  }
}

async function getGraphToken(bootstrapToken) {
  let response = await $.ajax({type: "GET", 
      url: "/auth",
      headers: {"Authorization": "Bearer " + bootstrapToken }, 
      cache: false
  });
  return response;
}


function handleClientSideErrors(error) {
  switch (error.code) {
    case 13001:
      // No one is signed into Office. If the add-in cannot be effectively used when no one 
      // is logged into Office, then the first call of getAccessToken should pass the 
      // `allowSignInPrompt: true` option. Since this add-in does that, you should not see
      // this error. 
      sso.showMessage("No one is signed into Office. But you can use many of the add-ins functions anyway. If you want to log in, press the Get OneDrive File Names button again.");  
      break;
    case 13002:
        // OfficeRuntime.auth.getAccessToken was called with the allowConsentPrompt 
        // option set to true. But, the user aborted the consent prompt. 
        sso.showMessage("You can use many of the add-ins functions even though you have not granted consent. If you want to grant consent, press the Get OneDrive File Names button again."); 
        break;
    case 13006:
        // Only seen in Office on the Web.
        sso.showMessage("Office on the Web is experiencing a problem. Please sign out of Office, close the browser, and then start again."); 
        break;
    case 13008:
        // The OfficeRuntime.auth.getAccessToken method has already been called and 
        // that call has not completed yet. Only seen in Office on the web.
        sso.showMessage("Office is still working on the last operation. When it completes, try this operation again."); 
        break;
    case 13010:
        // Only seen in Office on the web.
        sso.showMessage("Follow the instructions to change your browser's zone configuration.");
        break;
  
    default:
      // For all other errors, including 13000, 13003, 13005, 13007, 13012, 
      // and 50001, fall back to non-SSO sign-in.
      fallbackAuthHelper.dialogFallback();
      break;

  }
}

function handleAADErrors(exchangeResponse) {

  if ((exchangeResponse.error_description.indexOf("AADSTS500133") !== -1) 
  && (retryGetAccessToken <= 0)) 
   {
     retryGetAccessToken++;
     getGraphData();
   } else {                
    fallbackAuthHelper.dialogFallback();
   }  
  
  }
