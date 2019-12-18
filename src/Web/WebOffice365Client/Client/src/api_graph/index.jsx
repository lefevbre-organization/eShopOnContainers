/// <reference path="../components/sidebar/Sidebar.jsx" />
import { base64Data } from "./utils";
import config from "../Config";

const graph = require("@microsoft/microsoft-graph-client");

function getAuthenticatedClient(accessToken) {
  // Initialize Graph client
  const client = graph.Client.init({
    // Use the provided access token to authenticate
    // requests
    authProvider: done => {
      done(null, accessToken);
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

export const getLabelList = () =>
  new Promise((resolve, reject) => {
    var accessToken = window.msal.acquireTokenSilent(config.scopes);
    const client = getAuthenticatedClient(accessToken);
      client
      
      .api("/me/mailFolders")
      .get()
      .then(response => {
        resolve(response.value);
      });
  });

  export const getLabelInbox = () =>
  new Promise((resolve, reject) => {
    var accessToken = window.msal.acquireTokenSilent(config.scopes);
    const client = getAuthenticatedClient(accessToken);
    client
      .api("/me/mailFolders/inbox")
      .get()
      .then(response => {
        resolve(response);
      });
  });

//export const getMessageListPagination = ({ page }) =>
//    new Promise((resolve, reject) => {
//        getMessagePaginationList(page)
//            .then(getMessageHeaders)
//            .then(messageResult =>
//                flattenMessagesWithLabel(messageResult.messages, "").then(
//                    labelMessagesDetails => resolve({
//                        ...messageResult,
//                        messages: labelMessagesDetails.messages,
//                        label: labelMessagesDetails.label
//                    })
//                )
//            )
//            .catch(err => {
//                reject(err);
//            });
//    });

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

//export const getMessageList = ({ labelIds, maxResults, q, pageToken }) =>
//  new Promise((resolve, reject) => {
//    getMessageRawList({ labelIds, maxResults, pageToken, q })
//      .then(getMessageHeaders)
//      .then(messageResult =>
//        flattenMessagesWithLabel(messageResult.messages, labelIds).then(
//          labelMessagesDetails => resolve({
//            ...messageResult,
//            messages: labelMessagesDetails.messages,
//            label: labelMessagesDetails.label
//          })
//        )
//      )
//      .catch(err => {
//        reject(err);
//      });
//  });

export const flattenMessagesWithLabel = (messages, labelIds) =>
  new Promise((resolve, reject) => {
    //if (!labelIds) {
    resolve({
      messages,
      label: {
        result: {
          messagesTotal: 0
        }
      }
    });
    return;
    //}

    //window.gapi.client.gmail.users.labels
    //    .get({
    //        userId: "me",
    //        id: labelIds[0]
    //    })
    //    .then(response =>
    //        resolve({
    //            messages,
    //            label: response
    //        })
    //    );
  });

//export const flattenMessagesWithLabel = (messages, labelIds) =>
//  new Promise((resolve, reject) => {

//    if (!labelIds) {
//      resolve({
//        messages,
//        label: {
//          result: {
//            messagesTotal: 0
//          }
//        }
//      });
//      return;
//    }

//    window.gapi.client.gmail.users.labels
//      .get({
//        userId: "me",
//        id: labelIds[0]
//      })
//      .then(response =>
//        resolve({
//          messages,
//          label: response
//        })
//      );
//    });

// const getMessagePaginationList = ({ query }) =>
//   new Promise((resolve, reject) => {
//     query = `https://graph.microsoft.com/v1.0/me/mailFolders/AAMkADYwN2U5OWZlLWUwZDktNDQ3Yi05MTQ2LTMxYmUyMGExMjcwNgAuAAAAAAABGTrist65R5XlVfmY3KAqAQAcnBiKLwlKQrviB8XkwxacAAAAAAEMAAA=/messages?$top=20&$skip=80`;
//     var accessToken = window.msal.acquireTokenSilent(config.scopes);
//     const client = getAuthenticatedClient(accessToken);
//     client
//       .api(`${query}`)

//       .get()
//       .then(response => {
//         resolve(response);
//       })
//       .catch(err => {
//         reject(err);
//       });
//   });

const getMessageRawList = ({ labelIds, maxResults, pageToken, q = "" }) =>
  new Promise((resolve, reject) => {
    var accessToken = window.msal.acquireTokenSilent(config.scopes);
    const client = getAuthenticatedClient(accessToken);
    //if (pageToken == null)
    //    pageToken = 0
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

//const getMessageRawList = ({ labelIds, maxResults, pageToken, q = "" }) =>
//  new Promise((resolve, reject) => {
//    window.gapi.client.gmail.users.messages
//      .list({
//        userId: "me",
//        q,
//        maxResults: maxResults || MAX_RESULTS,
//        ...(labelIds && {labelIds}),
//        ...(pageToken && { pageToken })
//      })
//      .then(response => resolve(response))
//      .catch(err => {
//        reject(err);
//      });
//  });

export const getMessageHeaders = response => {
  //const messageResult = response.result;
  const messageResult = response;

  return new Promise((resolve, reject) => {
    //const headerPromises = (messageResult.messages || []).map(el => {
    const headerPromises = (messageResult.value || []).map(el => {
      return getMessageHeader(el.id);
    });

    Promise.all(headerPromises).then(messages =>
      resolve({
        ...messageResult,
        messages
      })
    );
  });
};

export const getMessageHeader = id => {
  return new Promise((resolve, reject) => {
    var accessToken = window.msal.acquireTokenSilent(config.scopes);
    const client = getAuthenticatedClient(accessToken);
    client
      .api(`me/messages/${id}`)
      //.select('id,parentFolderId,')
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
  return new Promise((resolve, reject) => {
    var accessToken = window.msal.acquireTokenSilent(config.scopes);
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

export const getMessageDetail = messageId => {
  return new Promise((resolve, reject) => {
    var accessToken = window.msal.acquireTokenSilent(config.scopes);
    const client = getAuthenticatedClient(accessToken);
    client
      .api(`me/messages/${messageId}`)
      .get()
      .then(response => {
        const result = response;
        let body = result.body;
        resolve({
          body,
          headers: response.headers,
          result: { ...result, messageHeaders: result, payload: undefined }
        });
      })
      .catch(error => {
        reject(error);
      });
  });
};

// Insert file attachments from Google Drive
// function getAttachments_(ids) {
//   var att = [];
//   for (var i in ids) {
//     var file = ids;
//     att.push({
//       mimeType: file.type(),
//       fileName: file.name()
//       //bytes: Utilities.base64Encode(file.getBlob().getBytes())
//     });
//   }
//   return att;
// }

export const emailEnd = () => {
  var email = `},
                 "SaveToSentItems": "true"
                  }`;
  return email;
};

export const emailBody = data => {
  const subject = data.subject;

  var myJSONString = JSON.stringify(data.content);
  var myEscapedJSONString = myJSONString.replace(/\\n/g, "\\n")
        .replace(/\\'/g, "\\'")
        .replace(/\\"/g, '\\"')
        .replace(/\\&/g, "\\&")
        .replace(/\\r/g, "\\r")
        .replace(/\\t/g, "\\t")
        .replace(/\\b/g, "\\b")
        .replace(/\\f/g, "\\f");
    
  const bodyContent = myEscapedJSONString.slice(1, -1);

  var email = `{
                  "Message": {
                    "Subject": "${subject}",
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
  //to BccRecipients
  var email = `"Attachments": [],`;
  var attachments = data.uppyPreviews;

  if (attachments.length <= 0) return email;

  email = `"Attachments": [`;
  for (var i = 0; i < attachments.length; i++) {
    var fileData = base64Data(attachments[i].base64);
    var fileName = attachments[i].file.name;

    email += `{
        "@odata.type": "#Microsoft.OutlookServices.FileAttachment",
        "Name": "${fileName}",
        "ContentBytes": "${fileData}"
      },\r\n`;
  }
  email += `],\r\n`;
  return email;
};

export const sendMessage = ({ data, attachments }) => {
  return new Promise((resolve, reject) => {
    let email = "";
    email = emailBody(data);
    email += emailToRecipients(data);
    email += emailToCcRecipients(data);
    email += emailToBccRecipients(data);
    email += emailAttachments(data);
    email += emailEnd();

    var accessToken = window.msal.acquireTokenSilent(config.scopes);
    const client = getAuthenticatedClient(accessToken);

      

    return client
      .api("/me/sendmail")
      .header("Authorization", "Bearer " + accessToken)
      .header("Content-Type", "application/json; charset=utf-8")
        .post(email, (err, response) => {
        resolve(response);
      });
  });
};

//export const batchModify = ({ids, addLabelIds = [], removeLabelIds = []}) => new Promise((resolve, reject) => {
//  window.gapi.client.gmail.users.messages
//    .batchModify({
//      userId: "me",
//      ids,
//      addLabelIds,
//      removeLabelIds
//    })
//    .then(response =>
//      {
//        resolve(ids)
//      }
//    );
//});

export const batchModify = ({ ids, addLabelIds = [], removeLabelIds = [] }) =>
  new Promise((resolve, reject) => {
    var accessToken = window.msal.acquireTokenSilent(config.scopes);
    const client = getAuthenticatedClient(accessToken);

    var deleteFolder = "deleteditems";

    var DestinationId = `{
                     "destinationId": "${deleteFolder}"
                     }`;
    return client
      .api(`me/messages/${ids}/move`)
      .header("Authorization", "Bearer " + accessToken)
      .header("Content-Type", "application/json")
      .post(DestinationId, (err, response) => {
        resolve(ids);
      });
  });
