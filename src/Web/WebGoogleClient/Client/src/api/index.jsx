import { MAX_RESULTS } from "../constants";
import { getBody, isHTML, base64MimeType, base64Data } from "./utils";

const getLabelDetailPromise = labelId => {
  return new Promise((resolve, reject) => {
    window.gapi.client.gmail.users.labels
      .get({
        userId: "me",
        id: labelId
      })
      .then(response => resolve(response));
  });
};

const getLabelDetails = labelList => {
  return new Promise((resolve, reject) => {
    const labelPromises = labelList.result.labels.map(el => {
      return getLabelDetailPromise(el.id);
    });

    Promise.all(labelPromises).then(response => resolve(response));
  });
};

export const getLabelList = () =>
  new Promise((resolve, reject) => {
    window.gapi.client.gmail.users.labels
      .list({
        userId: "me"
      })
      .then(getLabelDetails)
      .then(response => {
        resolve(response.map(el => el.result));
      });
  });


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
    if (!labelIds) {
      resolve({
        messages,
        label: {
          result: {
            messagesTotal: 0
          }
        }
      });
      return;
    }

    window.gapi.client.gmail.users.labels
      .get({
        userId: "me",
        id: labelIds[0]
      })
      .then(response =>
        resolve({
          messages,
          label: response
        })
      );
  });

const getMessageRawList = ({ labelIds, maxResults, pageToken, q = "" }) =>
  new Promise((resolve, reject) => {
    window.gapi.client.gmail.users.messages
      .list({
        userId: "me",
        q,
        maxResults: maxResults || MAX_RESULTS,
        ...(labelIds && { labelIds }),
        ...(pageToken && { pageToken })
      })
      .then(response => resolve(response))
      .catch(err => {
        reject(err);
      });
  });

const getMessageHeaders = response => {
  const messageResult = response.result;

  return new Promise((resolve, reject) => {
    const headerPromises = (messageResult.messages || []).map(el => {
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
  return new Promise((resolve, reject) => {
    window.gapi.client.gmail.users.messages
      .get({
        userId: "me",
        id: id,
        format: "metadata",
        metadataHeaders: [
          "Delivered-To",
          "X-Received",
          "To",
          "Message-ID",
          "Date",
          "Content-Type",
          "MIME-Version",
          "Reply-To",
          "From",
          "Subject",
          "Return-Path"
          // See https://www.iana.org/assignments/message-headers/message-headers.xhtml
          // for more headers
        ]
      })
      .then(response => {
        // console.log("response.result.payload.headers ->", response.result.payload.headers);
        resolve(response.result)
      });
  });
};

export const getMessage = messageId => {
  return new Promise((resolve, reject) => {
    window.gapi.client.gmail.users.messages
      .get({
        userId: "me",
        id: messageId,
        format: "full"
      })
      .then(response => {
        const { result } = response;

        let body = getBody(result.payload, "text/html");
        let attach = result.payload.parts;

        if (body === "") {
          body = getBody(result.payload, "text/plain");
          body = body
            .replace(/(\r\n)+/g, '<br data-break="rn-1">')
            .replace(/[\n\r]+/g, '<br data-break="nr">');
        }

        if (body !== "" && !isHTML(body)) {
          body = body
            .replace(
              /(\r\n)+/g,
              '<div data-break="rn-1" style="margin-bottom:10px"></div>'
            )
            .replace(/[\n\r]+/g, '<br data-break="nr">');
        }

        resolve({
          body,
          attach,
          headers: response.headers,
          result: {
            ...result,
            messageHeaders: response.result.payload.headers,
            payload: undefined
          }
        });
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const sendMessage = async ({ headers, body, attachments }) => {
  let email = "";

  const headersClone = { ...headers };
  headersClone["MIME-Version"] = "1.0";
  headersClone["Content-Type"] = `multipart/mixed; boundary=alternative`;

  for (let header in headersClone) {
    email += `${header}: ${headersClone[header]}\r\n`;
  }

  email += `\r\n`;
  email += `--alternative\r\n`;
  email += `Content-Type: multipart/alternative; boundary = "attached"\r\n`;
  email += `\r\n`;

  email += `--attached\r\n`;
  email += `Content-Type: text/plain; charset = "UTF-8"\r\n`;
  email += `Content-Transfer-Encoding: quoted-printable\r\n`;

  //text plain
  email += `\r\n`;
  email += `${body}\r\n`;
  email += `\r\n`;

  email += `--attached\r\n`;
  email += `Content-Type: text/html; charset = "UTF-8"\r\n`;
  email += `Content-Transfer-Encoding: quoted-printable\r\n`;

  //HTML
  email += `\r\n`;
  email += `\r\n<html><head></head><body>${body}</body></html>\r\n`;
  email += `\r\n`;

  email += `--attached--\r\n`;

  for (var i = 0; i < headersClone.attachments.length; i++) {
    var mimetype = headersClone.attachments[i].type;
    var fileData = base64Data(headersClone.attachments[i].content);
    var fileName = headersClone.attachments[i].name;

    email += `--alternative\r\n`;
    email += `Content-Type: ${mimetype}\r\n`;
    email += `Content-Transfer-Encoding: base64\r\n`;
    email += `Content-Disposition: attachment; filename = "${fileName}"\r\n`;
    email += `${fileData}\r\n`;
  }

  email += `--alternative--\r\n`;

  return fetch("https://www.googleapis.com/upload/gmail/v1/users/me/messages/send?uploadType=multipart", {
    method: 'POST',
    body: email,
    headers:{
      'Authorization': `Bearer ${window.gapi.auth.getToken().access_token}`,
      'Content-Type': 'message/rfc822'
    },
  });
};

export const setMessageAsRead = async messageId =>  new Promise((resolve, reject) => {
  window.gapi.client.gmail.users.messages
    .modify({
      userId: "me",
      id: messageId,
      addLabelIds: [],
      removeLabelIds: ['UNREAD']
    })
    .then(response => {
      resolve(messageId);
    });
});

export const batchModify = ({ ids, addLabelIds = [], removeLabelIds = [] }) =>
  new Promise((resolve, reject) => {
    window.gapi.client.gmail.users.messages
      .batchModify({
        userId: "me",
        ids,
        addLabelIds,
        removeLabelIds
      })
      .then(response => {
        resolve(ids);
      });
  });
