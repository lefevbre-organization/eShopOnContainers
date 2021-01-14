import { MAX_RESULTS } from '../constants';
import { getBody, isHTML, base64MimeType, base64Data } from './utils';
import base64url from 'base64url';
import quotedPrintable from 'quoted-printable';
import utf8 from 'utf8';
import { Base64 } from 'js-base64';
import mimemessage from 'mimemessage';
import {MimeBuilder} from "../utils/mimeBuilder";

const getLabelDetailPromise = (labelId) => {
  return new Promise((resolve, reject) => {
    window.gapi.client.gmail.users.labels
      .get({
        userId: 'me',
        id: labelId,
      })
      .then((response) => resolve(response));
  });
};

const getLabelDetails = (labelList) => {
  return new Promise((resolve, reject) => {
    const labelPromises = labelList.result.labels.map((el) => {
      return getLabelDetailPromise(el.id);
    });

    Promise.all(labelPromises).then((response) => resolve(response));
  });
};

export const getLabelList = () => {
  return new Promise((resolve, reject) => {
    window.gapi.client.gmail.users.labels
        .list({
          userId: 'me',
        })
        .then(getLabelDetails)
        .then((response) => {
          resolve(response.map((el) => el.result));
        });
  })
};

export const updateLabelName = (labelId, newName) => {
  return new Promise((resolve, reject) => {
    window.gapi.client.gmail.users.labels
        .update({
          userId: 'me',
          id: labelId,
          resource: {
            'id': labelId,
            name: newName
          }
        })
        .then((response) => resolve(response));
  });
};

export const getMessageList = ({ labelIds, maxResults, q, pageToken }) =>
  new Promise((resolve, reject) => {
    getMessageRawList({ labelIds, maxResults, pageToken, q })
      .then(getMessageHeaders)
      .then((messageResult) =>
        flattenMessagesWithLabel(messageResult.messages, labelIds).then(
          (labelMessagesDetails) =>
            resolve({
              ...messageResult,
              messages: labelMessagesDetails.messages,
              label: labelMessagesDetails.label,
            })
        )
      )
      .catch((err) => {
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
            messagesTotal: 0,
          },
        },
      });
      return;
    }

    window.gapi.client.gmail.users.labels
      .get({
        userId: 'me',
        id: labelIds[0],
      })
      .then((response) =>
        resolve({
          messages,
          label: response,
        })
      );
  });

const getMessageRawList = ({ labelIds, maxResults, pageToken, q = '' }) =>
  new Promise((resolve, reject) => {
    window.gapi.client.gmail.users.messages
      .list({
        userId: 'me',
        q,
        maxResults: maxResults || MAX_RESULTS,
        ...(labelIds && { labelIds }),
        ...(pageToken && { pageToken }),
      })
      .then((response) => resolve(response))
      .catch((err) => {
        reject(err);
      });
  });

export const getMessageListWithRFC = (q) =>
  new Promise((resolve, reject) => {
    window.gapi.client.gmail.users.messages
      .list({
        userId: 'me',
        q: `rfc822msgid:${q}`,
        maxResults: 1,
      })
      .then((response) => resolve(response))
      .catch((err) => {
        reject(err);
      });
  });


export const getDraftListWithRFC = (q) =>
  new Promise((resolve, reject) => {
    window.gapi.client.gmail.users.drafts
      .list({
        userId: 'me',
        q: `rfc822msgid:${q}`,
        maxResults: 1,
      })
      .then((response) => resolve(response))
      .catch((err) => {
        reject(err);
      });
  });

const getMessageHeaders = (response) => {
  const messageResult = response.result;

  return new Promise((resolve, reject) => {
    const headerPromises = (messageResult.messages || []).map((el) => {
      return getMessageHeader(el.id);
    });

    Promise.all(headerPromises).then((messages) =>
      resolve({
        ...messageResult,
        messages,
      })
    );
  });
};

export const getMessageHeadersFromId = (messageIds) => {
  return new Promise((resolve, reject) => {
    const headerPromises = (messageIds || []).map((messageId) => {
      return getMessageHeader(messageId);
    });

    Promise.all(headerPromises).then((messages) => {
      resolve({
        ...messageIds,
        messages,
      });
    });
  });
};

export const getMessageHeader = (id) => {
  return new Promise((resolve, reject) => {
    window.gapi.client.gmail.users.messages
      .get({
        userId: 'me',
        id: id,
        format: 'metadata',
        metadataHeaders: [
          'Delivered-To',
          'X-Received',
          'To',
          'Message-ID',
          'Date',
          'Content-Type',
          'MIME-Version',
          'Reply-To',
          'From',
          'Subject',
          'Return-Path',
          // See https://www.iana.org/assignments/message-headers/message-headers.xhtml
          // for more headers
        ],
      })
      .then((response) => {
        // console.log("response.result.payload.headers ->", response.result.payload.headers);
        resolve(response.result);
      });
  });
};

export const getMessage = (messageId, format) => {
  return new Promise((resolve, reject) => {
    window.gapi.client.gmail.users.messages
      .get({
        userId: 'me',
        id: messageId,
        format: format || 'full',
      })
      .then((response) => {
        const { result } = response;

        if (format === 'raw') {
          resolve({
            result: base64url.decode(result.raw),
          });
        } else {
          let body = getBody(result.payload, 'text/html');
          let attach = result.payload.parts;

          if (body === '') {
            body = getBody(result.payload, 'text/plain');
            body = body
              .replace(/(\r\n)+/g, '<br data-break="rn-1">')
              .replace(/[\n\r]+/g, '<br data-break="nr">');
          }

          if (body !== '' && !isHTML(body)) {
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
              payload: undefined,
            },
          });
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// Creates a random guid
function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

// Receives an email message (in plain text) and cuts it into lines of 76 characters max to comply with internet message protocol rfc max length
function limitLineLengthPlain(txt) {
  let res = '';
  var lineLength = 75;
  var innerCounter = 1;
  txt = encodeURI(txt).replace(/%20/g, ' ').replace(/%/g, '=');
  for (let index = 0; index < txt.length; index++) {
    if (innerCounter == lineLength || index === txt.length - 1) {
      res += txt[index];
      res += `=\n`;
      innerCounter = 1;
    } else {
      res += txt[index];
      innerCounter++;
    }
  }
  return res;
}

// Receives an email message (in html) and cuts it into lines of 76 characters max to comply with internet message protocol rfc max length.
function limitLineLengthHtml(html) {
  let res = '';
  var lineLength = 76;
  var innerCounter = 1;
  for (let index = 0; index < html.length; index++) {
    if (innerCounter == lineLength || index === html.length - 1) {
      res += html[index];
      res += `=\n`;
      innerCounter = 1;
    } else {
      res += html[index];
      innerCounter++;
    }
  }
  return res;
}

// Receives the data of an attachment in base64 and cuts it in 76 characters lines.
function parseAttachment(fileData) {
  let parsedFileData = '';
  var lineLength = 76;
  var innerCounter = 1;
  if (fileData) {
    for (let index = 0; index < fileData.length; index++) {
      parsedFileData += fileData[index];
      if (innerCounter == lineLength || index === fileData.length - 1) {
        parsedFileData += `\n`;
        innerCounter = 1;
      } else {
        innerCounter++;
      }
    }
  }
  return parsedFileData;
}

// Given an emaiil in html format, and a list of images, returns the email in plain text
function removeHtmlTags(body, imgList) {
  // var rex = /(<([^>]+)>)/ig;
  // return body.replace(rex, "");
  body = body
    .replace(`<br>`, `\r\n`)
    .replace(`</br>`, ``)
    .replace(`<p>`, `\r\n`)
    .replace(`</p>`, ``)
    .replace(`<strong>`, `*`)
    .replace(`</strong>`, `*`);
  for (let index = 0; index < imgList.length; index++) {
    const img = imgList[index];
    body = body.replace(img, `\r\n[image: ${getContentName(img)}]`);
  }
  var temp = document.createElement('div');
  temp.innerHTML = body;
  return temp.textContent || temp.innerText || '';
}

// Gets all the <img src> tags of the email
function getEmbeddedImages(body) {
  let res = [];
  let images = body.match(/<img [^>]*src="[^"]*"[^>]*>/gm);
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    if (!image.match(/src="http[^>]*/g)) {
      res.push(image);
    }
  }
  console.log('getEmbeddedImages:');
  console.log(images);
  let imagesData = images.map((x) => x.replace(/.*src="([^"]*)".*/, '$1'));
  console.log('imagesData');
  console.log(imagesData);
  //return images;
  return res;
}

// Receives the list of images and generates a unique id for each of them.
function genEmbedImgIds(images) {
  let ids = [];
  for (let index = 0; index < images.length; index++) {
    const element = images[index];
    const name = getContentName(element);
    const random = uuidv4().slice(0, 8);
    ids.push(`${name.replace('.', '')}__${random}`);
  }
  return ids;
}

// Receives a single image html tag <img src> and returns the type of the image: jpg, png, etc.
function getContentType(imageTag) {
  let src;
  let srcSplitted;
  let contentType;
  src = imageTag.replace(/.*src="([^"]*)".*/, '$1');
  srcSplitted = src.split(';');
  contentType = srcSplitted[0].replace('data:', '');
  console.log('getContentType:' + contentType);
  return contentType;
}

// Receives a single image html tag <img src> and returns the name of the image: image1.png, image2.jpeg, etc.
function getContentName(imageTag) {
  let contentName;
  contentName = imageTag.replace(/.*alt="([^"]*)".*/, '$1');
  console.log('getContentName:' + contentName);
  return contentName;
}

// Receives a single image html tag <img src> and returns the image data in base64
function getImageData(imageTag) {
  let src;
  let srcSplitted;
  let imageData;
  src = imageTag.replace(/.*src="([^"]*)".*/, '$1');
  srcSplitted = src.split(',');
  imageData = srcSplitted[1];
  imageData = parseAttachment(imageData);
  console.log('getImageData:' + imageData);
  return imageData;
}

// Receives an email body, the list of images and the list of unique ids of those images and returns the body formatted with the image Id's
function formatBodyImages(body, embedddedImagesList, embeddedImagesIds) {
  for (let index = 0; index < embedddedImagesList.length; index++) {
    const element = embedddedImagesList[index];
    const src = element.replace(/.*src="([^"]*)".*/, '$1');
    body = body.replace(src, `cid:${embeddedImagesIds[index]}`);
  }
  return body;
}

const getDataEmail = ({ headers, body, attachments }) => {
  let message = new MimeBuilder();

  for(let h in headers) {
    if (headers.hasOwnProperty(h)) {
      message.addHeader(h, headers[h]);
    }
  }

  if(body !== '') {
    message.addAlternative(body);
  }

  for(let i = 0; i < attachments.length; i++) {
    message.addAttachment(attachments[i]);
  }

  return message.toString();
}

export const getAttachments = async ({ messageId, attachmentId }) => {
  return new Promise((resolve, reject) => {
    const request = window.gapi.client.gmail.users.messages.attachments.get({
      userId: 'me',
      messageId: messageId, 
      id: attachmentId
    });
    request.execute((err, res) => {
      if (err.error) {
        reject(err.error);
      } else {
        resolve(err);
      }
    });
  });
};

export const dataUrlToFile = ({dataUrl, mimeType}) => {
 
 dataUrl = dataUrl
  .replace(/-/g, "+")
  .replace(/_/g, "/");
  
  const byteCharacters = window.atob(dataUrl);
  
  let byteNumbers = byteCharacters.length;
  let byteArray = new Uint8Array(byteNumbers);

  while (byteNumbers--) {
    byteArray[byteNumbers] = byteCharacters.charCodeAt(byteNumbers);
  }
  return new Blob([byteArray], {
    type: mimeType
  });

}

export const deleteDraft = async ({ draftId }) => {
  return new Promise((resolve, reject) => {
    const request = window.gapi.client.gmail.users.drafts.delete({
      userId: 'me',
      id: draftId
    });
    request.execute((err, res) => {
      if (err.error) {
        reject(err.error);
      } else {
        resolve(err);
      }
    });
  });
};

export const createDraft = async ({ headers, body, attachments, draftId }) => {
 
  let email = getDataEmail({ headers, body, attachments });

  return new Promise((resolve, reject) => {
    const base64EncodedEmail = Base64.encodeURI(email);
    let draft = null;
    if(draftId != '') {
      draft =  window.gapi.client.gmail.users.drafts.update({
        userId: 'me',
        id: draftId,
        resource: {
          message: {
            raw: base64EncodedEmail,
          }
        },
      });
     } else {
      draft = window.gapi.client.gmail.users.drafts.create({
        userId: 'me',
        resource: {
          message: {
            raw: base64EncodedEmail,
          }
        },
      });
    }
    
    draft.execute((err, res) => {
      if (err.error) {
        reject(err.error);
      } else {
        resolve(err);
      }
    });
  });
};


export const sendMessage = async ({ headers, body, attachments }) => {
  
  let email = getDataEmail({ headers, body, attachments });

  return new Promise((resolve, reject) => {
    const base64EncodedEmail = Base64.encodeURI(email);
    const request = window.gapi.client.gmail.users.messages.send({
      userId: 'me',
      resource: {
        raw: base64EncodedEmail,
      },
    });
    request.execute((err, res) => {
      if (err.error) {
        reject(err.error);
      } else {
        resolve(err);
      }
    });
  });
};

export const setMessageAsRead = async (messageId) =>
  new Promise((resolve, reject) => {
    window.gapi.client.gmail.users.messages
      .modify({
        userId: 'me',
        id: messageId,
        addLabelIds: [],
        removeLabelIds: ['UNREAD'],
      })
      .then((response) => {
        resolve(messageId);
      });
  });

export const batchModify = ({ ids, addLabelIds = [], removeLabelIds = [] }) =>
  new Promise((resolve, reject) => {
    window.gapi.client.gmail.users.messages
      .batchModify({
        userId: 'me',
        ids,
        addLabelIds,
        removeLabelIds,
      })
      .then((response) => {
        resolve(ids);
      });
  });

export const batchDeleteMessages = ({ ids }) =>
    new Promise((resolve, reject) => {
        window.gapi.client.gmail.users.messages
            .batchDelete({
                userId: 'me',
                ids               
            })
            .then((response) => {
                resolve(ids);
            })    
          .catch((error) => {
            reject(error);
          });
    });

/**
 * Load Google Calendar Events
 */
//export const getEventList = (idCalendar) =>
//  new Promise((resolve, reject) => {
//    window.gapi.client.calendar.events
//      .list({
//        calendarId: idCalendar,
//        //timeMin: (new Date()).toISOString(),
//        //maxResults: 10,
//        singleEvents: true,
//        orderBy: 'startTime',
//      })
//      .then((response) => {
//        resolve(response);
//      })
//      .catch((error) => {
//        reject(error);
//      });
//  });

///**
// * Load Google Calendar List
// */
////export const getCalendarList = () =>
////    new Promise((resolve, reject) => {
////        window.gapi.client.calendar.calendarList.list()
////            .then(response => {
////                resolve(response);

////            })
////         .catch(error => {
////             reject(error);
////         });

////    });

//export const getCalendarList = () =>
//  new Promise((resolve, reject) => {
//    window.gapi.client.calendar.calendarList
//      .list({})

//      .then((response) => {
//        resolve(response.result);
//      })
//      .catch((err) => {
//        reject(err);
//      });
//  });

//export const addCalendarEvent = (calendar, event) =>
//  new Promise((resolve, reject) => {
//    window.gapi.client.calendar.events
//      .insert({
//        calendarId: 'primary',
//        resource: event,
//      })

//      .then((response) => {
//        resolve(response.result);
//      })
//      .catch((err) => {
//        reject(err);
//      });
//  });

//export const deleteCalendarEvent = (calendar, eventId) =>
//  new Promise((resolve, reject) => {
//    window.gapi.client.calendar.events
//      .delete({
//        calendarId: 'primary',
//        eventId: eventId,
//      })

//      .then((response) => {
//        resolve(response.result);
//      })
//      .catch((err) => {
//        reject(err);
//      });
//  });
