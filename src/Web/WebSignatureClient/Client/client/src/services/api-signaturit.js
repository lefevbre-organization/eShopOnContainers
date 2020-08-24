import { backendRequest, backendRequestCompleted, preDownloadSignatures } from '../actions/application';
import { resolve } from 'path';

// tenia 94 left y 5 width
// const coordinates = [
//   {
//     left: 94,
//     top: 35,
//     height: [30],
//     width: 5
//   },
//   {
//     left: 94,
//     top: 10,
//     height: [30, 60],
//     width: 5
//   },
//   {
//     left: 94,
//     top: 6,
//     height: [25, 37, 68],
//     width: 5
//   },
//   {
//     left: 94,
//     top: 2,
//     height: [22, 26, 52, 76],
//     width: 5
//   },
//   {
//     left: 94,
//     top: 1,
//     height: [1, 20, 39, 58, 77],
//     width: 5
//   }
// ];


const coordinates = [
  {
    left: 94,
    top: [35],
    height: 30,
    width: 5
  },
  {
    left: 94,
    top: [10, 60],
    height: 30,
    width: 5
  },
  {
    left: 94,
    top: [6, 37, 68],
    height: 25,
    width: 5
  },
  {
    left: 94,
    top: [2, 26, 52, 76],
    height: 22,
    width: 5
  },
  {
    left: 94,
    top: [1, 20, 39, 58, 77],
    height: 18,
    width: 5
  },
  {
    left: 94,
    top: [1, 17, 33, 49, 65, 81],
    height: 15,
    width: 5
  },
  {
    left: 94,
    top: [1, 15, 29, 43, 57, 71, 85],
    height: 13,
    width: 5
  },
  {
    left: 94,
    top: [1, 13, 25, 37, 49, 61, 73, 85],
    height: 11,
    width: 5
  },
  {
    left: 94,
    top: [1, 12, 23, 34, 45, 56, 67, 78, 89],
    height: 10,
    width: 5
  },
  {
    left: 94,
    top: [1, 10, 19, 28, 37, 46, 55, 64, 73, 82],
    height: 8,
    width: 5
  }
];


/* 
  SIGNATURIT API CALLS 
*/

// Gets all the signatures associated with an account
export const getSignatures = async () => {
  var request = require('request');
  var options = {
      'method': 'GET',
      'url': 'https://api.sandbox.signaturit.com/v3/signatures.json',
      'headers': {
          'Authorization': `Bearer dUOCDEBBbBfZlycygqbVpRhToLHIzSAxmzdZsUrrhBkRwStavdTLMrMBYACZUckFMbNrwFFmWLUqLmhxxuahvy`
  }
  };
  request(options, function (error, response) { 
      if (error) throw new Error(error);
      console.log(response.body);
      dispatch(preDownloadSignatures(Json.parse(response.body)));
  });
}

// Gets info of one specific signature by id
export const getSignaturesById = async (id) => {
  var request = require('request');
  var options = {
      'method': 'GET',
      'url': `https://api.sandbox.signaturit.com/v3/signatures${id}.json`,
      'headers': {
          'Authorization': `Bearer dUOCDEBBbBfZlycygqbVpRhToLHIzSAxmzdZsUrrhBkRwStavdTLMrMBYACZUckFMbNrwFFmWLUqLmhxxuahvy`
  }
  };
  request(options, function (error, response) { 
      if (error) throw new Error(error);
      console.log(response.body);
      let signature = JSON.parse(response.body);
      signature = calculateStatus(signature);
      return signature;
  });
}

// Preloads all signatures associated with an account
export function preloadSignatures(dispatch, filters) {
  return new Promise((resolve, reject) => {
    //dispatch(backendRequest());
    var request = require('request');
    var options = {
        'method': 'GET',
        'url': `https://api.sandbox.signaturit.com/v3/signatures.json?lefebvre_id=${filters}`,
        'headers': {
            'Authorization': `Bearer dUOCDEBBbBfZlycygqbVpRhToLHIzSAxmzdZsUrrhBkRwStavdTLMrMBYACZUckFMbNrwFFmWLUqLmhxxuahvy`
    }
    };
    request(options, function (error, response) { 
        if (error) {
          reject(error);
        }
        //dispatch(preDownloadSignatures(null));
  
        console.log(response.body);
        let signatures = JSON.parse(response.body);
        console.log('Datos recibidos de signaturit - GetSignatures:');
        console.log({signatures});
        signatures = calculateStatus(signatures);
        console.log({signatures});
        dispatch(preDownloadSignatures(signatures));
        resolve(signatures);
    });
    //dispatch(backendRequestCompleted());
  })
}

// Creates a new signature request
export const createSignature = async (recipients, subject, body, files, reminders, expiration, lefebvreId, guid, brandingId) => {
  return new Promise((resolve,reject) => {
    var myHeaders = new Headers();
    var i = 0;
    myHeaders.append("Authorization", `Bearer dUOCDEBBbBfZlycygqbVpRhToLHIzSAxmzdZsUrrhBkRwStavdTLMrMBYACZUckFMbNrwFFmWLUqLmhxxuahvy`);
  
    var formdata = new FormData();
    recipients.forEach(element => {
      formdata.append(`recipients[${i}][name]`, element.split('@')[0]);
      formdata.append(`recipients[${i}][email]`, element);
      i += 1;
    });
    formdata.append("files[0]", files, files.name);
    formdata.append("data[lefebvre_id]", lefebvreId);
    formdata.append("data[lefebvre_guid]", guid);
    formdata.append("data[subject]", subject);
    formdata.append("data[body]", body);
    formdata.append("subject", subject);
    formdata.append("body", body);
    formdata.append("reminders", reminders);
    formdata.append("expire_time", expiration);
    formdata.append("branding_id", brandingId);
  
    var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: formdata,
    redirect: 'follow'
    };
  
    fetch("https://api.sandbox.signaturit.com/v3/signatures.json", requestOptions)
    .then(response => response.json())
    .then(result => {
      console.log(result)
      console.log('Aquí debemos meter la inserción en Mongo');
      resolve(result);
    })
    .catch(error => {
      console.log('error', error)
      reject(error);
    });
  })
}

// Downloads a document that's been signed 
export const downloadSignedDocument = (signId, docId, fileName) => {
  var myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer dUOCDEBBbBfZlycygqbVpRhToLHIzSAxmzdZsUrrhBkRwStavdTLMrMBYACZUckFMbNrwFFmWLUqLmhxxuahvy`);

  //var formdata = new FormData();

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    //body: formdata,
    redirect: 'follow'
  };

  fetch(`https://api.sandbox.signaturit.com/v3/signatures/${signId}/documents/${docId}/download/signed`, requestOptions)
    .then(response => response.blob())
    .then(blob => {
      console.log(blob);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    })
    .catch(error => console.log('error', error));
}

// Downloads the trail information of a signed document
export const downloadTrailDocument = (signId, docId, fileName) => {
  var myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer dUOCDEBBbBfZlycygqbVpRhToLHIzSAxmzdZsUrrhBkRwStavdTLMrMBYACZUckFMbNrwFFmWLUqLmhxxuahvy`);

  console.log(`https://api.sandbox.signaturit.com/v3/signatures/${signId}/documents/${docId}/download/audit_trail`);

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  fetch(`https://api.sandbox.signaturit.com/v3/signatures/${signId}/documents/${docId}/download/audit_trail`, requestOptions)
    .then(response => response.blob())
    .then(blob => {
      console.log(blob);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'audit-'+fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    })
    .catch(error => console.log('error', error));
}

// Sends a reminder to pending signers
export const sendReminder = async (signatureId) => {
  var myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer dUOCDEBBbBfZlycygqbVpRhToLHIzSAxmzdZsUrrhBkRwStavdTLMrMBYACZUckFMbNrwFFmWLUqLmhxxuahvy`);

  var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  redirect: 'follow'
  };

  fetch(`https://api.sandbox.signaturit.com/v3/signatures/${signatureId}/reminder.json`, requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));
}

// Cancels a signature
export const cancelSignature = async (signatureId) => {
  var myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer dUOCDEBBbBfZlycygqbVpRhToLHIzSAxmzdZsUrrhBkRwStavdTLMrMBYACZUckFMbNrwFFmWLUqLmhxxuahvy`);

  var requestOptions = {
  method: 'PATCH',
  headers: myHeaders,
  redirect: 'follow'
  };

  fetch(`https://api.sandbox.signaturit.com/v3/signatures/${signatureId}/cancel.json`, requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));
}

// Creates a new Branding
export const createBranding = async template => {
  console.log("Template que se va a enviar a Signaturit");
  console.log(template);
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer dUOCDEBBbBfZlycygqbVpRhToLHIzSAxmzdZsUrrhBkRwStavdTLMrMBYACZUckFMbNrwFFmWLUqLmhxxuahvy");

    var formdata = new FormData();
    formdata.append("application_texts[sign_button]", template.application_texts.sign_button);
    formdata.append("application_texts[send_button]", template.application_texts.send_button);
    formdata.append("application_texts[open_sign_button]", template.application_texts.open_sign_button);
    formdata.append("application_texts[open_email_button]", template.application_texts.open_email_button);
    formdata.append("application_texts[terms_and_conditions]", template.application_texts.terms_and_conditions);
    formdata.append("layout_color", template.layout_color);
    formdata.append("logo", template.logo);
    formdata.append("signature_color", template.signature_color);
    formdata.append("templates[signatures_request]", template.templates.signatures_request);
    formdata.append("templates[signatures_receipt]", template.templates.signatures_receipt);
    formdata.append("templates[pending_sign]", template.templates.pending_sign);
    formdata.append("templates[document_canceled]", template.templates.document_canceled);
    formdata.append("templates[request_expired]", template.templates.request_expired);
    formdata.append("text_color", template.text_color);
    formdata.append("show_survey_page", template.show_survey_page);
    formdata.append("show_csv", template.show_csv);
    formdata.append("show_biometric_hash", template.show_biometric_hash);
    formdata.append("show_welcome_page", template.show_welcome_page);

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
      redirect: 'follow'
    };

    fetch("https://api.sandbox.signaturit.com/v3/brandings.json", requestOptions)
      .then(response => response.json())
      .then(result => {
        console.log(result);
        resolve(result);
      })
      .catch(error => {
        console.log('error', error);
        reject(error)
      });
  });
}

// END SIGNATURIT API CALLS


/* 
  LEFEBVRE SIGNATURE BACKEND API CALLS 
*/

export const getUserSignatures = async userId => {
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Accept", "text/plain");
    
    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };
    
    fetch(`${window.API_SIGN_GATEWAY}/Signatures/${userId}`, requestOptions)
      .then(response => response.json())
      .then(result => resolve(result))
      .catch(error => {
        console.log('error', error);
        reject(error);
      });
  })
};

// Creates a new user with empty signatures or with a new signature
export const createUser = async (userId, brandings = [], signatures = []) => {
  var myHeaders = new Headers();
    myHeaders.append("Accept", "text/plain");
    myHeaders.append("Content-Type", "application/json-patch+json");
    myHeaders.append("Content-Type", "text/plain");

  var raw = `{
  \n  "user\": \"${userId}\",
  \n  \"availableSignatures\": 0,
  \n  \"brandings\": ${JSON.stringify(brandings)},
  \n  \"signatures\": ${JSON.stringify(signatures)}
  \n}`;

  console.log("Este es el raw de CreateUser");
  console.log(raw);
  console.log({raw});

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch(`${window.API_SIGN_GATEWAY}/Signatures`, requestOptions)
    .then(response => {
      console.log(response);
      response.text()
    })
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}

// Adds or updates a signature of a given user
export const addOrUpdateSignature = async (userId, externalId, guid, app, documents) => {
  var myHeaders = new Headers();
  myHeaders.append("Accept", "text/plain");
  myHeaders.append("Content-Type", "application/json-patch+json");
  myHeaders.append("Content-Type", "text/plain");

  var raw = `{
  \n  \"externalId\": \"${externalId}\",
  \n  \"guid\": \"${guid}\",
  \n  \"app\": \"${app}\",
  \n  \"documents\": ${JSON.stringify(documents)}
  \n}`;

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch(`${window.API_SIGN_GATEWAY}/Signatures/${userId}/signature/addorupdate`, requestOptions)
    .then(response => {
      console.log(response);
      response.text()
    })
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}

// Deletes all signatures of a given user
export const deleteUser = async userId => {
  var myHeaders = new Headers();
  myHeaders.append("Accept", "text/plain");
  myHeaders.append("Content-Type", "application/json-patch+json");

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    redirect: 'follow'
  };

  fetch(`${window.API_SIGN_GATEWAY}/Signatures/${userId}/delete`, requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}

// export const getAvailableSignatures = async userId => {
//   return new Promise((resolve, reject) => {
//     var requestOptions = {
//       method: 'GET',
//       redirect: 'follow'
//     };
  
//     fetch(`${window.API_SIGN_GATEWAY}/Signatures/${userId}/getAvailableSignatures`, requestOptions)
//       .then(response => response.json())
//       .then(result => {
//         console.log(result);
//         resolve(result);
//       })
//       .catch(error => {
//         console.log('error', error);
//         reject(error);
//       })
//   })
// }

export const saveAvailableSignatures = async (userId, num) => {
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify(num);

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    fetch(`${window.API_SIGN_GATEWAY}/Signatures/${userId}/setAvailableSignatures`, requestOptions)
      .then(response => response.json())
      .then(result => {
        console.log(result);
        resolve(result);
      })
      .catch(error => {
        console.log('error', error);
        reject(error);
      });
    })
}

export const decAvailableSignatures = async userId => {
  return new Promise((resolve, reject) => {

    var requestOptions = {
      method: 'POST',
      body: '',
      redirect: 'follow'
    };
    
    fetch(`${window.API_SIGN_GATEWAY}/Signatures/${userId}/DecAvailableSignatures`, requestOptions)
      .then(response => response.json())
      .then(result => {
        console.log(result);
        resolve(result);
      })
      .catch(error => {
        console.log('error', error);
        reject(error);
      });
  })
}

export const getBrandingTemplate = async app => {
  return new Promise((resolve, reject) => {
    var requestOptions = {
      method: 'GET',
      redirect: 'follow'
    };
    
    fetch(`${window.API_SIGN_GATEWAY}/Brandings/get/${app}/template`, requestOptions)
      .then(response => response.json())
      .then(result => {
        console.log(result);
        resolve(result);
      })
      .catch(error => {
        console.log('error', error);
        reject(error);
      });
  })
}

export const addOrUpdateBranding = async (user, brandingInfo) => {
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Accept", "text/plain");
    myHeaders.append("Content-Type", "application/json-patch+json");
    myHeaders.append("Content-Type", "text/plain");
    
    var raw = `${JSON.stringify(brandingInfo)}`;
    // \n	\"app\": \"${brandingInfo[0].app}\",
    // \n	\"externalId\": "${brandingInfo[0].externalId}"
    // \n}`;

    console.log("Este es el raw de CreataddOrUpdateBrandingeUser");
    console.log(raw);
    console.log({raw});
  
    
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
    
    fetch(`${window.API_SIGN_GATEWAY}/Signatures/${user}/branding/addorupdate`, requestOptions)
      .then(response => response.json())
      .then(result => {
        console.log(result);
        resolve(result);
      })
      .catch(error => {
        console.log('error', error);
        reject(error)
      });
  })
}

export const createTemplate = async (templateInfo) => {
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    
    var raw = JSON.stringify(templateInfo);
    
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
    
    fetch(`${window.API_SIGN_GATEWAY}/Brandings/addBaseConfigTest`, requestOptions)
      .then(response => response.json())
      .then(result => {
        console.log(result);
        resolve(result);
      })
      .catch(error => {
        console.log('error', error);
        reject(error)
      });
})
}
// END OF LEFEBVRE SIGNATURE API CALLS


/* 
  LEFEBVRE SIGNATURE BACKEND GATEWAY SIGNATURIT API CALLS 
*/
  
// Preloads all signatures associated with an account calling internal proxy api
export function preloadSignatures2(dispatch, filters, auth) {
  return new Promise((resolve, reject) => {

    var myHeaders = new Headers();
    myHeaders.append("Authorization", `${auth}`);
    
    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };
    
    fetch(`${window.API_SIGN_GATEWAY}/Signaturit/getSignatures/${filters}`, requestOptions)
      .then(response => response.json())
      .then(result => {
        console.log(result);
        let signatures = result;
        console.log('Datos recibidos de signaturit - GetSignatures:');
        console.log({signatures});
        signatures = calculateStatus(signatures);
        console.log({signatures});
        dispatch(preDownloadSignatures(signatures));
        resolve(signatures);
      })
      .catch(error => {
        console.log('error', error);
        reject(error);
      });
  })
}

// Creates a new signature calling internal proxy api
//export const createSignature2 = async (recipients, subject, body, files, filesData, reminders, expiration, lefebvreId, guid, brandingId, auth) => {
  export const createSignature2 = async (recipients, cc, subject, body, files, pagesConfig, reminders, expiration, lefebvreId, guid, brandingId, auth) => {
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Accept", "text/plain");
    myHeaders.append("Content-Type", "application/json-patch+json");
    myHeaders.append("Content-Type", "text/plain");
    myHeaders.append("Authorization", `${auth}`);

    var jsonObject = {};
    var recipientsData = [];
    var ccData = [];
    var filesData = [];
    var customFieldsData = [];
    var remindConfig = '';
    var expirationConfig = '';
    var signAllPagesCoords = [];

    switch (reminders[0]) {
      case -1:
        remindConfig = 'notConfigured';
        break;
      case 1:
        remindConfig = 'Daily';
        break;
      case 7:
        remindConfig = 'Weekly';
        break;
      default:
        remindConfig = `Custom:${reminders[0]}`;
        break;
    }

    switch (expiration){
      case -1: 
        expirationConfig = 'notConfigured';
        break;
      case 0:
        expirationConfig = 'never';
        break;
      default:
        expirationConfig = expiration;
        break;
    }

    //var fileData = '';
    recipients.forEach(recipient => {
      recipientsData.push({name: recipient.split('@')[0], email: recipient})
    });
    jsonObject.recipients = recipientsData;

    cc.forEach(recipient => {
      ccData.push({name: recipient.split('@')[0], email: recipient})
    });
    jsonObject.cc = ccData;
    //filesData.push({file: filesData, fileName: files.name})
    // files.forEach(file => {
    //   filesData.push({file: file, fileName: file.name})
    // });
    files.forEach(file => {
      filesData.push({file: file.content, fileName: file.fileName})
      if (pagesConfig === 2){ // firma en todas las hojas
        let numRecipients = recipients.length;
        let numPages = file.pages;
        let element = '';
        for (let i = 0; i < numRecipients; i++) {
          for (let x = 0; x < numPages; x++) {
            element = `recipients[${i}][widgets][${x}][page]`;
            signAllPagesCoords.push({param: element, value: x + 1});
            element = `recipients[${i}][widgets][${x}][left]`;
            signAllPagesCoords.push({param: element, value: coordinates[numRecipients-1].left});
            element = `recipients[${i}][widgets][${x}][top]`;
            signAllPagesCoords.push({param: element, value: coordinates[numRecipients-1].top[i]});
            element = `recipients[${i}][widgets][${x}][type]`;
            signAllPagesCoords.push({param: element, value: 'signature'});
            element = `recipients[${i}][widgets][${x}][height]`;
            signAllPagesCoords.push({param: element, value: coordinates[numRecipients-1].height});
            element = `recipients[${i}][widgets][${x}][width]`;
            signAllPagesCoords.push({param: element, value: coordinates[numRecipients-1].width});

          }
        }
      }
      console.log(file);
    })
    //jsonObject.files = [{file: filesData, fileName: files.name}];
    jsonObject.files = filesData;
    jsonObject.coordinates = signAllPagesCoords;
    jsonObject.deliveryType = (signAllPagesCoords.length > 0 ? 'email' : '');


    customFieldsData.push({name: "lefebvre_id", value: lefebvreId});
    customFieldsData.push({name: "lefebvre_guid", value: guid});
    customFieldsData.push({name: "subject", value: subject});
    customFieldsData.push({name: "body", value: body});
    customFieldsData.push({name: "reminders", value: remindConfig});
    customFieldsData.push({name: "expiration", value: expirationConfig});
    // customFieldsData.push({name: "expiration", value: expiration});
    // customFieldsData.push({name: "reminders", value: reminders});
    jsonObject.customFields = customFieldsData;

    jsonObject.subject = subject;
    jsonObject.body = body;
    (reminders[0] !== -1) ? jsonObject.reminders = reminders : null;
    (expiration !== -1) ? jsonObject.expiration = expiration : null;
    jsonObject.brandingId = brandingId;

    
    var raw = JSON.stringify(jsonObject);
    console.log('Raw::');
    console.log(raw);
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
    
    fetch(`${window.API_SIGN_GATEWAY}/Signaturit/newSignature`, requestOptions)
      .then(response => response.json())
      .then(result => {
        resolve(result)
        console.log(result)
      })
      .catch(error => {
        reject(error);
        console.log('error', error)
      });
  })
}

// Downloads a document that's been signed calling internal proxy api
export const downloadSignedDocument2 = (signId, docId, fileName, auth) => {
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `${auth}`);
    
    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };
    
    fetch(`${window.API_SIGN_GATEWAY}/Signaturit/download/${signId}/signedDocument/${docId}`, requestOptions)
      .then(response => response.blob())
      .then(blob => {
        console.log(blob);
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      })
      .catch(error => console.log('error', error));
  })
}

// Downloads the trail information of a signed document calling internal proxy api
export const downloadTrailDocument2 = (signId, docId, fileName, auth) => {
  var myHeaders = new Headers();
  myHeaders.append("Authorization", `${auth}`);

  console.log(`https://api.sandbox.signaturit.com/v3/signatures/${signId}/documents/${docId}/download/audit_trail`);

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  fetch(`${window.API_SIGN_GATEWAY}/Signaturit/download/${signId}/trailDocument/${docId}`, requestOptions)
    .then(response => response.blob())
    .then(blob => {
      console.log(blob);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'audit-'+fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    })
    .catch(error => console.log('error', error));
}

// Sends a reminder to pending signers calling internal proxy api
export const sendReminder2 = async (signatureId, auth) => {
  var myHeaders = new Headers();
  myHeaders.append("Authorization", `${auth}`);

  var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  redirect: 'follow'
  };

  fetch(`${window.API_SIGN_GATEWAY}/Signaturit/reminder/${signatureId}`, requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));
}

// Cancels a signature calling internal proxy api
export const cancelSignature2 = async (signatureId, auth) => {
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `${auth}`);

    var requestOptions = {
    method: 'PATCH',
    headers: myHeaders,
    redirect: 'follow'
    };

    fetch(`${window.API_SIGN_GATEWAY}/Signaturit/cancelSignature/${signatureId}`, requestOptions)
    .then(response => response.text())
    .then(result => {
      console.log(result);
      resolve(result);
    })
    .catch(error => {
      console.log('error', error)
      reject(error)
    });
  });
}

// Creates a new Branding calling internal proxy api
export const createBranding2 = async (template, auth) => {
  console.log("Template que se va a enviar a Signaturit");
  console.log(template);
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Accept", "text/plain");
    myHeaders.append("Content-Type", "application/json-patch+json");
    myHeaders.append("Content-Type", "text/plain");
    myHeaders.append("Authorization", `${auth}`);

    var jsonObject = {};

    jsonObject.application_texts = {
      sign_button: template.application_texts.sign_button,
      send_button: template.application_texts.send_button,
      open_sign_button: template.application_texts.open_sign_button,
      open_email_button: template.application_texts.open_email_button,
      terms_and_conditions: template.application_texts.terms_and_conditions
    }
    jsonObject.layout_color = template.layout_color;
    jsonObject.logo = template.logo;
    jsonObject.signature_color = template.signature_color;
    jsonObject.templates = {
      signatures_request: template.templates.signatures_request,
      signatures_receipt:  template.templates.signatures_receipt,
      pending_sign:  template.templates.pending_sign,
      document_canceled:  template.templates.document_canceled,
      request_expired:  template.templates.request_expired
    }
    jsonObject.text_color = template.text_color
    jsonObject.show_survey_page = template.show_survey_page
    jsonObject.show_csv = template.show_csv
    jsonObject.show_biometric_hash = template.show_biometric_hash
    jsonObject.show_welcome_page = template.show_welcome_page

    var raw = JSON.stringify(jsonObject);
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    fetch(`${window.API_SIGN_GATEWAY}/Signaturit/newBranding`, requestOptions)
      .then(response => response.json())
      .then(result => {
        console.log(result);
        resolve(result);
      })
      .catch(error => {
        console.log('error', error);
        reject(error)
      });
  });
}


/* 
  HELPER FUNCTIONS 
*/

const calculateStatus = (signatures) => {
  console.log('Signatures before: ');
  console.log({signatures});
  let numSigners = 0;
  let numCompleted = 0;
  let numInProgress = 0;
  let numCancelled = 0;
  let numRejected = 0;
  let numExpired = 0;
  let numError = 0;
  let numInQueue = 0;
  signatures.map(signature => {
    numSigners = signature.documents.length;
      signature.documents.map( document => {
      switch (document.status) {
        case 'completed':
          numCompleted += 1;
          break;
        case 'ready':
          numInProgress += 1;
          break;
        case 'canceled':
          numCancelled += 1;
          break;
        case 'declined':
          numRejected += 1;
          break;
        case 'expired':
          numExpired += 1;
          break;
        case 'error':
          numError += 1;
          break;
        case 'in_queue':
          numInQueue += 1;
          break;
        default:
          break;
      }
    })
    console.log('NumSigners: '+ numSigners);
    if (numSigners === numCompleted){
      signature.status = 'completed';
    } else if (numSigners > 0 && numCompleted < numSigners && numCancelled === 0 && numRejected === 0 && numExpired === 0 && numInQueue === 0 && numError === 0){
      signature.status = 'ready';
    } else if (numSigners > 0 && numCancelled > 0){
      signature.status = 'canceled';
    } else if (numSigners > 0 && numRejected > 0){
      signature.status = 'declined';
    } else if (numSigners > 0 && numExpired > 0){
      signature.status = 'expired';
    } else if (numSigners > 0 && numError > 0){
      signature.status = 'error';
    } else if (numSigners > 0 && numInQueue > 0){
      signature.status = 'pending';
    }
    numSigners = 0;
    numCompleted = 0;
    numInProgress = 0;
    numCancelled = 0;
    numRejected = 0;
    numExpired = 0;
    numError = 0;
    numInQueue = 0;
  })
  console.log("Signatures after: ");
  console.log({signatures});
  return signatures;
};

// END HELPER FUNCTIONS
  
export const getUser = async userId => {
    const url = `${window.URL_GET_ACCOUNTS}/${userId}`;
    const url2 = `${window.API_GATEWAY}/api/v1/lex/Lexon/user?idUserNavision=${userId}`;
  
    try {
      const res = await fetch(url, { method: 'GET' });
      const user = await res.json();
      const res2 = await fetch(url2, { method: 'GET' });
      const navUser = await res2.json();
      user.data.lexonUserId = navUser.data.idUser;
  
      return user;
    } catch (err) {
      throw err;
    }
  };

export const getAttachmentLex = async (bbdd, attachmentId, userId) => {
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    
    var raw = JSON.stringify({"idEntity":attachmentId,"bbdd":bbdd,"idUser":userId});
    
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
    
    fetch("https://lexbox-test-apigwlex.lefebvre.es/api/v1/lex/Lexon/entities/files/get", requestOptions)
      .then(response => response.json())
      .then(result => {
        console.log(result);
        resolve(result);
      })
      .catch(error => {
        console.log('error', error);
        reject(error);
      });
  })
}

export const getAttachmentCen = async (userId, attachmentId) => {
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Accept", "text/plain");
    myHeaders.append("Content-Type", "application/json-patch+json");
        
    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    //userId = 'E1669460'; //Para pruebas
    
    fetch(`https://lexbox-test-apigwcen.lefebvre.es/api/v1/cen/concepts/files/get?idNavisionUser=${userId}&idDocument=${attachmentId}`, requestOptions)
    .then(response => response.json())
    .then(result => {
      console.log(result);
      resolve(result);
    })
    .catch(error => {
      console.log('error', error);
      reject(error);
    });
  })
}

export const cancelSignatureCen = async (guid) => {
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Accept", "text/plain");
    myHeaders.append("Content-Type", "application/json-patch+json");
        
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      redirect: 'follow'
    };
    
    //fetch(`https://lexbox-test-apigwcen.lefebvre.es/api/v1/cen/signatures/cancelation/${guid}}`, requestOptions)
    fetch(`https://lexbox-test-apigwcen.lefebvre.es/api/v1/cen/signatures/cancelation/${guid}`, requestOptions)
    .then(response => response.json())
    .then(result => {
      console.log(result);
      resolve(result);
    })
    .catch(error => {
      console.log('error', error);
      reject(error);
    });
  })
}

export const getAvailableSignatures = async (companyId, numDocuments) => {
  // return new Promise((resolve, reject) => {
  //   var myHeaders = new Headers();
  //   //myHeaders.append("Access-Control-Allow-Origin", "*");

  //   var requestOptions = {
  //     method: 'GET',
  //     //headers: myHeaders,
  //     redirect: 'follow'
  //   };
    
  //   fetch(`${window.API_CHECK_CREDITS}/ComprobarPuedeCrearFirmaDigital?IdClientNav=${companyId}&NumDocuments=${numDocuments}&idUic=1`, requestOptions)
  //     .then(response => response.text())
  //     .then(result => {
  //       //resolve(result);
  //       resolve(true);
  //       console.log(result);
  //     })
  //     .catch(error => {
  //       console.log('error', error);
  //       reject(error);
  //     });
  // })
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Accept", "text/plain");
    
    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };
    
    fetch(`${window.API_SIGN_GATEWAY}/Signatures/${companyId}/checkAvailableSignatures/${numDocuments}`, requestOptions)
      .then(response => response.text())
      .then(result => resolve(result))
      //.then(result =>  resolve(true)) // Se pone para pruebas
      .catch(error => {
        console.log('error', error);
        reject(error);
      });
  })
}

export const notifySignature = async (userId, companyId, numDocuments) => {
  return new Promise((resolve, reject) => {

    var requestOptions = {
      method: 'GET',
      redirect: 'follow'
    };
    
    fetch(`${window.API_CHECK_CREDITS}/CrearFirmaDigital?IdClientNav=${companyId}&idUsuarioPro=${userId}&NumDocuments=${numDocuments}&idUic=1`, requestOptions)
      .then(response => response.text())
      .then(result => {
        console.log(result);
        resolve (result);
      })
      .catch(error => {
        console.log('error', error);
        reject(error);
      });
  })
}

// export const createSignature = async (recipients, files) => {
//     var request = require('request');
//     var fs = require('fs');
//     var options = {
//         'method': 'POST',
//         'url': 'https://api.sandbox.signaturit.com/v3/signatures.json',
//         'headers': {
//             'Authorization': 'Bearer dUOCDEBBbBfZlycygqbVpRhToLHIzSAxmzdZsUrrhBkRwStavdTLMrMBYACZUckFMbNrwFFmWLUqLmhxxuahvy'
//         },
//         formData: {
//             'recipients[0][name]': 'Jorge',
//             'recipients[0][email]': 'jorgevalls@hotmail.com',
//             'files[0]': {
//             'value': files, //fs.createReadStream('/C:/azure-devops/LEF/Tickets/Signaturit/Documento super importante.docx'),
//             'options': {
//                 'filename': '/C:/azure-devops/LEF/Tickets/Signaturit/Documento super importante.docx',
//                 'contentType': null
//                 }
//             }
//         }
//     };
//     request(options, function (error, response) { 
//         if (error) throw new Error(error);
//         console.log(response.body);
        
//     });
// }


// export const createSignature = async (recipients, files) => {

//     var unirest = require('unirest');
//     var req = unirest('POST', 'https://api.sandbox.signaturit.com/v3/signatures.json')
//     .headers({
//         'Authorization': 'Bearer dUOCDEBBbBfZlycygqbVpRhToLHIzSAxmzdZsUrrhBkRwStavdTLMrMBYACZUckFMbNrwFFmWLUqLmhxxuahvy'
//     })
//     .field('recipients[0][name]', 'Jorge')
//     .field('recipients[0][email]', 'jorgevalls@hotmail.com')
//     .attach('file', files)
//     .field('data[lefebvre_id]', 'E1654569')
//     .end(function (res) { 
//         if (res.error) {
//             console.log(res.error);
//             throw new Error(res.error); 
//         }
        
//         console.log(res.raw_body);
//     });
// }