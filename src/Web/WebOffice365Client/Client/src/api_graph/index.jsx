/// <reference path="../components/sidebar/Sidebar.jsx" />
import { base64Data } from "./utils";
import config from "../Config";
import { UserAgentApplication } from "msal";

const graph = require("@microsoft/microsoft-graph-client");
let userAgentApplication = null;

export const getUserApplication = () => {
  if (userAgentApplication === null) {

    let redirectUri = window.location.origin

    userAgentApplication = new UserAgentApplication({
      auth: {
        clientId: config.appId,
        redirectUri: redirectUri
      },
      cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: true
      }
    });

    userAgentApplication.handleRedirectCallback((error, response)=>{
    });
  }

  return userAgentApplication
}

export const getAuthenticatedClient = (accessToken) => {
  // Initialize Graph client
  const client = graph.Client.init({
    // Use the provided access token to authenticate
    // requests
    authProvider: done => {
      done(null, accessToken.accessToken);
    }
  });

  return client;
}

//ALBERTO TO-DO IMPLEMENT RECURSIVE FOLDERS

//export const getLabelList = () =>
//    new Promise((resolve, reject) => {
//        window.gapi.client.gmail.users.labels
//            .list({
//                userId: "me"
//            })
//            .then(getLabelDetails)
//            .then(response => {
//                resolve(response.map(el => el.result));
//            });
//    });

//const getLabelDetailPromise = labelId => {
//  return new Promise((resolve, reject) => {
//    window.gapi.client.gmail.users.labels
//      .get({
//        userId: "me",
//        id: labelId
//      })
//      .then(response => resolve(response));
//  });
//};

//const getLabelDetails = labelList => {
//  return new Promise((resolve, reject) => {
//    const labelPromises = labelList.result.labels.map(el => {
//      return getLabelDetailPromise(el.id);
//    });

//    Promise.all(labelPromises).then(response => resolve(response));
//  });
//};

//END IMPLEMENT RECURSIVE FOLDERS

export const getAccessTokenSilent = async () => {
  console.log(config.scopes)
  return await window.msal.acquireTokenSilent({ scopes: config.scopes });
}

export const getLabelList = async () => {
  const accessToken = await getAccessTokenSilent();
  const client = await getAuthenticatedClient(accessToken);

  try {
    const folders = await client.api('/me/mailFolders').get();
    return folders.value;
  } catch (err) {
    console.log(err)
  }

  return [];
}

export const getLabelInbox = () =>
  new Promise(async (resolve, reject) => {
    const accessToken = await getAccessTokenSilent();
    const client = getAuthenticatedClient(accessToken);
    client
      .api("/me/mailFolders/inbox")
      .get()
      .then(response => {
        resolve(response);
      });
  });


export const getLabelSentItems = async () => {
  const accessToken = await getAccessTokenSilent();
  const client = getAuthenticatedClient(accessToken);
  const response = await client.api("/me/mailFolders/sentItems").get();

  return response;
}

export const getMessageList = ({ labelIds, maxResults, q, pageToken }) =>
  new Promise((resolve, reject) => {
    getMessageRawList({ labelIds, maxResults, pageToken, q })
      .then(getMessageHeaders)
      .then(messageResult =>
        flattenMessagesWithLabel(messageResult.messages, labelIds).then(
          labelMessagesDetails =>
            resolve({
              ...messageResult,
              messages: labelMessagesDetails.messages,
              label: labelMessagesDetails.label
            })
        )
      )
      .catch(err => {
        reject(err);
      });
  });

export const flattenMessagesWithLabel = (messages, labelIds) =>
  new Promise((resolve, reject) => {
    resolve({
      messages,
      label: {
        result: {
          messagesTotal: 0
        }
      }
    });
    return;

  });

const getMessageRawList = ({ labelIds, maxResults, pageToken, q = "" }) =>
  new Promise(async (resolve, reject) => {
    const accessToken = await getAccessTokenSilent();
    const client = getAuthenticatedClient(accessToken);
    if (pageToken != null) {
      client
        .api(`${pageToken}`)

        .get()
        .then(response => {
          resolve(response);
        })
        .catch(err => {
          reject(err);
        });
    } else {
      if (q === "") {
        client
          .api(`me/mailFolders/${labelIds}/messages`)
          .top(`${maxResults}`)
          .get()
          .then(response => {
            resolve(response);
          })
          .catch(err => {
            reject(err);
          });
      } else {
        client
          .api(`me/messages?$search=${q}`)
          .top(`${maxResults}`)
          .get()
          .then(response => {
            resolve(response);
          })
          .catch(err => {
            reject(err);
          });
      }
    }
  });

export const getMessageHeaders = response => {
  const messageResult = response;

  return new Promise((resolve, reject) => {
    const headerPromises = (messageResult.value || []).map(el => {
      return getMessageHeader(el.id);
    });

    Promise.all(headerPromises).then(messages => {
      resolve({
        ...messageResult,
        messages
      });
    });
  });
};

export const getMessageHeadersFromId = messageIds => {
  return new Promise((resolve, reject) => {
    const headerPromises = (messageIds || []).map(messageId => {
      return getMessageHeader(messageId);
    });

    Promise.all(headerPromises).then(messages => {
      resolve({
        ...messageIds,
        messages
      });
    });
  });
};

export const getMessageHeader = id => {
  return new Promise(async (resolve, reject) => {
    const accessToken = await getAccessTokenSilent();
    const client = getAuthenticatedClient(accessToken);
    client
      .api(`me/messages/${id}`)
      .get()
      .then(response => resolve(response))
      .catch(err => {
        reject(err);
      });
  });
};

export const getMessage = messageId =>
  new Promise((resolve, reject) => {
    getMessageDetail(messageId)
      .then(Messagedetail =>
        getAttachmentsList(messageId).then(MessagesandAttachementsDetails =>
          resolve({
            ...Messagedetail,
            attach: MessagesandAttachementsDetails
          })
        )
      )
      .catch(err => {
        reject(err);
      });
  });

export const getAttachmentsList = messageId => {
  return new Promise(async (resolve, reject) => {
    const accessToken = await getAccessTokenSilent();
    const client = getAuthenticatedClient(accessToken);
    client
      .api(`me/messages/${messageId}/attachments`)
      .get()
      .then(response => resolve(response.value))
      .catch(err => {
        reject(err);
      });
  });
};

export const getMessageDetail = async messageId => {
  try {
    const accessToken = await getAccessTokenSilent();
    const client = getAuthenticatedClient(accessToken);

    const response = await client.api(`me/messages/${messageId}`).get()
    const result = response;

    return {
      body: result.body,
      headers: response.headers,
      result: { ...result, messageHeaders: result, payload: undefined }
    }
  } catch (err) {
    throw err;
  }
};

export const getMessageByInternetMessageId = async internetMessageId => {
  try {
    const accessToken = await getAccessTokenSilent();
    const client = getAuthenticatedClient(accessToken);

    const response = await client.api(`me/messages?$filter=internetMessageId eq '${internetMessageId}'`).get()
    const result = response.value[response.value.length-1];
    console.log("hola response: " + result.id);

    return {
      id: result.id,
      subject: result.subject,
      sentDateTime: result.sentDateTime
    }
  } catch (err) {
    throw err;
  }
};

export const emailEnd = () => {
  var email = `}`;
  return email;
};

export const emailBody = data => {

  const guid = data.internetMessageId;
  const subject = data.subject.replace(/\"/g, '\\"');

  var myJSONString = JSON.stringify(data.content);
  var myEscapedJSONString = myJSONString
    .replace(/\\n/g, "\\n")
    .replace(/\\'/g, "\\'")
    .replace(/\\"/g, '\\"')
    .replace(/\\&/g, "\\&")
    .replace(/\\r/g, "\\r")
    .replace(/\\t/g, "\\t")
    .replace(/\\b/g, "\\b")
    .replace(/\\f/g, "\\f");

  const bodyContent = myEscapedJSONString.slice(1, -1);

  var email = `{
                    "Subject": "${subject}",
                    "internetMessageId": "${guid}",
                    "Body": {
                      "ContentType": "html",
                      "Content": "${bodyContent}"
                    },\r\n`;

  return email;
};

export const emailToRecipients = data => {
  //to Recipients
  var email = `[]`;
  if (data.to === "") return email;

  var toRecipients = data.to.split(",");
  email = `"ToRecipients": [`;
  for (var i = 0; i < toRecipients.length; i++) {
    email += `{
                        "EmailAddress": {
                          "Address": "${toRecipients[i]}"
                        }
                      },\r\n`;
  }
  email += `],\r\n`;
  return email;
};

export const emailToCcRecipients = data => {
  //to Recipients
  var email = `"CcRecipients": [],`;
  if (data.cc === "") return email;

  var toCcRecipients = data.cc.split(",");
  email = `"CcRecipients": [`;
  for (var i = 0; i < toCcRecipients.length; i++) {
    email += `{
                        "EmailAddress": {
                          "Address": "${toCcRecipients[i]}"
                        }
                      },\r\n`;
  }
  email += `],\r\n`;
  return email;
};

export const emailToBccRecipients = data => {
  //to BccRecipients
  var email = `"BccRecipients": [],`;
  if (data.bcc === "") return email;

  var toBccRecipients = data.bcc.split(",");
  email = `"BccRecipients": [`;
  for (var i = 0; i < toBccRecipients.length; i++) {
    email += `{
                        "EmailAddress": {
                          "Address": "${toBccRecipients[i]}"
                        }
                      },\r\n`;
  }
  email += `],\r\n`;
  return email;
};

export const emailAttachments = data => {
  var email = `"Attachments": [],`;
  var attachments = data.uppyPreviews;

  if (attachments.length <= 0) return email;

  email = `"Attachments": [`;
  for (var i = 0; i < attachments.length; i++) {
    if(attachments[i].data.size <= 3145728) {
      var fileData = base64Data(attachments[i].content);
      var fileName = attachments[i].data.name;

      email += `{
          "@odata.type": "#Microsoft.OutlookServices.FileAttachment",
          "Name": "${fileName}",
          "ContentBytes": "${fileData}"
        },\r\n`;
    } 
  }
  email += `],\r\n`;
  return email;
};

export const sendMessage = async ({ data, attachments }) => {
  let email = "";
  email = emailBody(data);
  email += emailToRecipients(data);
  email += emailToCcRecipients(data);
  email += emailToBccRecipients(data);
  //email += emailAttachments(data);
  email += emailEnd();

  try {
    const accessToken = await getAccessTokenSilent();
    const client = getAuthenticatedClient(accessToken);
    let response = await client.api("/me/messages").version('beta').post(email);

    await uploadFiles(response.id, data.uppyPreviews);
    response = await client.api(`/me/messages/${response.id}/send`).version('beta').post({});
    return response;
  } catch (err) {
    console.log(err)
    throw err;
  }
};

export const setMessageAsRead = async messageId => {
  try {
    const accessToken = await getAccessTokenSilent();
    const client = getAuthenticatedClient(accessToken);

    await client.api(`me/messages/${messageId}`).patch({
      isRead: true
    })
    return true;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const batchModify = async ({ ids, addLabelIds = [], removeLabelIds = [] }) => {
  const accessToken = await getAccessTokenSilent();
  const client = getAuthenticatedClient(accessToken);
  const deleteFolder = "deleteditems";
  const DestinationId = `{
                     "destinationId": "${deleteFolder}"
                     }`;

  let prs = [];
  if (ids && ids.length) {
    for (let i = 0; i < ids.length; i++) {
      prs.push(client
        .api(`me/messages/${ids[i]}/move`)
        .post(DestinationId))
    }
  }

  await Promise.all(prs);
  return ids
}

export const uploadFiles = async(emailId, attachments) => {
  for (var i = 0; i < attachments.length; i++) {
    if(attachments[i].data.size > 4194304) {
      await uploadFileWithUploadSession(emailId, attachments[i].data, attachments[i].content);
    } else {
      await uploadFile(emailId, attachments[i].data, attachments[i].content);
    }
  }
}

export const uploadFile = async(emailId, file, content) => {
  const accessToken = await getAccessTokenSilent();
  const client = await getAuthenticatedClient(accessToken);

  const data = content.split('base64,')[1];

  const attachment = {
    "@odata.type": "#microsoft.graph.fileAttachment",
    name: file.name,
    contentBytes:data
  };
  
  try {
  let res = await client.api(`/me/messages/${emailId}/attachments`)
    .version('beta')
    .post(attachment);

    console.log(res);
  } catch(err) {
    console.log(err);
  }
  
}

export const uploadFileWithUploadSession = async(emailId, file, content) => {
  const accessToken = await getAccessTokenSilent();
  const client = await getAuthenticatedClient(accessToken);
  const uploadSession = {
    AttachmentItem: {
      attachmentType: "file",
      name: file.name, 
      size: file.size
    }
  };

    try {   
      const session = await client.api(`/me/messages/${emailId}/attachments/createUploadSession`).version('beta').post(uploadSession);
      
      console.log(content)
      await fetch(session.uploadUrl,
        {
          method: 'PUT',
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Length": `${file.size}`,
            "Content-Range": `bytes 0-${file.size-1}/${file.size}`
          },
          body: content
      });
    } catch (err) {
      console.log(err)
    }
  
  return [];
}