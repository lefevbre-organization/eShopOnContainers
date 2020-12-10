import { backendRequest, backendRequestCompleted, preDownloadSignatures, preDownloadEmails, preDownloadSmsList } from '../actions/application';
import { resolve } from 'path';

const fakedata = [
  {
      "certificates": [
          {
              "created_at": "2020-11-23T18:00:00+0000",
              "id": "6f35be89-f6e7-4ee0-bff3-b294b0669300",
              "name": "",
              "phone": "+34696634322",
              "events": [
                  {
                      "created_at": "2020-11-23T18:00:00+0000",
                      "type": "sms_processed"
                  },
                  {
                      "created_at": "2020-11-23T18:05:00+0000",
                      "type": "certification_completed"
                  },
                  {
                      "created_at": "2020-11-23T18:10:00+0000",
                      "type": "sms_delivered"
                  }
              ],
              "status": "sent"
          }
      ],
      "created_at": "2020-11-23T18:00:00+0000",
      "data": [
          {
              "key": "body",
              "value": " Prueba simulada 001"
          },
          {
              "key": "additional_info",
              "value": "i=0:phone=+34696634322:name=Jorge Valls Povedano:email=jorge.valls.povedano@gmail.com|"
          },
          {
              "key": "lefebvre_guid",
              "value": "f8c8f87f-dfed-48eb-9241-695b1ff61c00"
          },
          {
              "key": "certification_type",
              "value": "delivery"
          },
          {
              "key": "lefebvre_id",
              "value": "E1654569"
          }
      ],
      "id": "5951a596-2904-11eb-8356-0241c1fe0400"
  },
  {
      "certificates": [
          {
              "created_at": "2020-11-23T18:10:00+0000",
              "file": {
                  "name": "Seguro.pdf",
                  "pages": 2,
                  "size": 143835
              },
              "id": "b5eafe43-dd7f-4073-8127-04fe51b62b01",
              "name": "",
              "phone": "+34684113869",
              "events": [
                  {
                      "created_at": "2020-11-23T18:10:00+0000",
                      "type": "sms_processed"
                  },
                  {
                      "created_at": "2020-11-23T18:10:05+0000",
                      "type": "sms_delivered"
                  }
              ],
              "status": "sent"
          }
      ],
      "created_at": "2020-11-23T18:10:00+0000",
      "data": [
          {
              "key": "lefebvre_id",
              "value": "E1654569"
          },
          {
              "key": "body",
              "value": "Prueba simulada 002"
          },
          {
              "key": "lefebvre_guid",
              "value": "eab9e49b-0c65-480f-a4f7-891c04548101"
          },
          {
              "key": "certification_type",
              "value": "open_every_document"
          },
          {
              "key": "additional_info",
              "value": "i=0:phone=+34684113869:name=Jorge Valls:email=jorgevalls@hotmail.com|"
          }
      ],
      "id": "d7fd20f8-2998-11eb-8356-0241c1fe0401"
  },
  {
      "certificates": [
          {
              "created_at": "2020-11-23T18:15:00+0000",
              "file": {
                  "name": "Seguro.PDF",
                  "pages": 2,
                  "size": 143835
              },
              "id": "6e9148b3-b6db-4afd-bdba-834513b7bf02",
              "name": "Jorge Valls",
              "phone": "+34684113869",
              "events": [
                  {
                      "created_at": "2020-11-23T18:15:00+0000",
                      "type": "sms_processed"
                  },
                  {
                      "created_at": "2020-11-23T18:15:05+0000",
                      "type": "sms_delivered"
                  },
                  {
                      "created_at": "2020-11-23T18:15:10+0000",
                      "type": "documents_opened"
                  },
                  {
                      "created_at": "2020-11-23T18:15:15+0000",
                      "type": "document_opened"
                  },
                  {
                      "created_at": "2020-11-23T18:15:20+0000",
                      "type": "certification_completed"
                  }
              ],
              "status": "sent"
          },
          {
              "created_at": "2020-11-23T18:15:00+0000",
              "file": {
                  "name": "Acta_notarial.pdf",
                  "pages": 1,
                  "size": 30783
              },
              "id": "b5b46001-11c5-4752-94c8-52f20a674002",
              "name": "Jorge Valls",
              "phone": "+34684113869",
              "events": [
                  {
                      "created_at": "2020-11-23T18:15:30+0000",
                      "type": "documents_opened"
                  },
                  {
                      "created_at": "2020-11-23T18:15:35+0000",
                      "type": "document_opened"
                  },
                  {
                      "created_at": "2020-11-23T18:15:40+0000",
                      "type": "document_opened"
                  }
              ],
              "status": "in_queue"
          },
          {
              "created_at": "2020-11-23T18:20:00+0000",
              "file": {
                  "name": "Acta_notarial.pdf",
                  "pages": 1,
                  "size": 30783
              },
              "id": "c2bbfbdd-3e96-488a-8cde-8d59e9a95902",
              "name": "Valerie Campos",
              "phone": "+34696634322",
              "events": [
                  {
                      "created_at": "2020-11-23T18:20:05+0000",
                      "type": "sms_processed"
                  },
                  {
                      "created_at": "2020-11-23T18:20:10+0000",
                      "type": "sms_delivered"
                  },
                  {
                      "created_at": "2020-11-23T18:20:15+0000",
                      "type": "documents_opened"
                  },
                  {
                      "created_at": "2020-11-23T18:20:20+0000",
                      "type": "document_opened"
                  },
                  {
                      "created_at": "2020-11-23T18:20:25+0000",
                      "type": "certification_completed"
                  },
                  {
                      "created_at": "2020-11-23T18:20:30+0000",
                      "type": "documents_opened"
                  },
                  {
                      "created_at": "2020-11-23T18:25:35+0000",
                      "type": "documents_opened"
                  }
              ],
              "status": "sent"
          },
          {
              "created_at": "2020-11-23T18:30:00+0000",
              "file": {
                  "name": "Seguro.PDF",
                  "pages": 2,
                  "size": 143835
              },
              "id": "f64b3cb3-343a-4246-920c-effc0596b805",
              "name": "Valerie Campos",
              "phone": "+34696634322",
              "events": [
                  {
                      "created_at": "2020-11-23T18:30:00+0000",
                      "type": "documents_opened"
                  },
                  {
                      "created_at": "2020-11-23T18:30:10+0000",
                      "type": "document_opened"
                  },
                  {
                      "created_at": "2020-11-23T18:30:15+0000",
                      "type": "documents_opened"
                  },
                  {
                      "created_at": "2020-11-23T18:30:20+0000",
                      "type": "documents_opened"
                  }
              ],
              "status": "in_queue"
          }
      ],
      "created_at": "2020-11-23T18:30:00+0000",
      "data": [
          {
              "key": "subject",
              "value": "TEST 002: 2 RECIPIENTS - OPEN EVERY DOCUMENT"
          },
          {
              "key": "lefebvre_id",
              "value": "E1654569"
          },
          {
              "key": "type",
              "value": "open_every_document"
          },
    {
              "key": "additional_info",
              "value": "i=0:phone=+34684113869:name=Jorge Valls:email=jorgevalls@hotmail.com|i=1:phone=+34696634322:name=Valerie Campos:email=vavicampos@gmail.com|"
          }
      ],
      "id": "f2c8c256-2349-11eb-8356-0241c1fe0405"
  },
  {
      "certificates": [
          {
              "created_at": "2020-11-23T18:35:00+0000",
              "file": {
                  "name": "Seguro.pdf",
                  "pages": 2,
                  "size": 143835
              },
              "id": "58e40b23-db1d-413c-b5ba-899bc8e66a06",
              "name": "",
              "phone": "+34672095663",
              "events": [
                  {
                      "created_at": "2020-11-23T18:35:00+0000",
                      "type": "sms_processed"
                  },
                  {
                      "created_at": "2020-11-23T18:35:10+0000",
                      "type": "sms_delivered"
                  },
                  {
                      "created_at": "2020-11-23T18:35:20+0000",
                      "type": "documents_opened"
                  },
                  {
                      "created_at": "2020-11-23T18:35:25+0000",
                      "type": "document_opened"
                  },
                  {
                      "created_at": "2020-11-23T18:35:30+0000",
                      "type": "certification_completed"
                  },
                  {
                      "created_at": "2020-11-23T18:35:35+0000",
                      "type": "documents_opened"
                  }
              ],
              "status": "sent"
          },
          {
              "created_at": "2020-11-23T18:35:00+0000",
              "file": {
                  "name": "Acta_notarial.pdf",
                  "pages": 1,
                  "size": 30783
              },
              "id": "672f0108-2314-4af5-9008-3c2ffb0d6006",
              "name": "",
              "phone": "+34672095663",
              "events": [
                  {
                      "created_at": "2020-11-23T18:35:40+0000",
                      "type": "documents_opened"
                  },
                  {
                      "created_at": "2020-11-23T18:35:45+0000",
                      "type": "document_opened"
                  },
                  {
                      "created_at": "2020-11-23T18:35:50+0000",
                      "type": "documents_opened"
                  }
              ],
              "status": "in_queue"
          }
      ],
      "created_at": "2020-11-23T18:40:00+0000",
      "data": [
          {
              "key": "body",
              "value": "Esto es una prueba de sms certificado en la demo 35"
          },
          {
              "key": "lefebvre_id",
              "value": "E1654569"
          },
          {
              "key": "additional_info",
              "value": "i=0:phone=+34672095663:name=Sergio López:email=s.lopez@gmail.com|"
          },
          {
              "key": "lefebvre_guid",
              "value": "e49df929-fc2b-42b6-a3bf-0957b733dca8"
          },
          {
              "key": "certification_type",
              "value": "open_every_document"
          }
      ],
      "id": "ff257613-2988-11eb-8356-0241c1fe04da"
  }
];
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
  LEFEBVRE SIGNATURE BACKEND API CALLS
*/
/*
   _____ _                   _                    ____             _                  _ 
  / ____(_)                 | |                  |  _ \           | |                | |
 | (___  _  __ _ _ __   __ _| |_ _   _ _ __ ___  | |_) | __ _  ___| | _____ _ __   __| |
  \___ \| |/ _` | '_ \ / _` | __| | | | '__/ _ \ |  _ < / _` |/ __| |/ / _ \ '_ \ / _` |
  ____) | | (_| | | | | (_| | |_| |_| | | |  __/ | |_) | (_| | (__|   <  __/ | | | (_| |
 |_____/|_|\__, |_| |_|\__,_|\__|\__,_|_|  \___| |____/ \__,_|\___|_|\_\___|_| |_|\__,_|
            __/ |                                                                       
           |___/                                                                                                                       
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
      .then(response => {
        if (response.ok){
          return response.json()
        }
        else {
          return response.json()
        }
      })
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
      .then(response => {
        if (response.ok){
          return response.json()
        }
        else {
          throw new Error("Status:" + response.status + ' ' + " Headers:" + response.headers);
        }
      })
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

    fetch(`${window.API_SIGN_GATEWAY}/Brandings/add`, requestOptions)
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

/*
  ______                 _ _   ____             _                  _ 
 |  ____|               (_) | |  _ \           | |                | |
 | |__   _ __ ___   __ _ _| | | |_) | __ _  ___| | _____ _ __   __| |
 |  __| | '_ ` _ \ / _` | | | |  _ < / _` |/ __| |/ / _ \ '_ \ / _` |
 | |____| | | | | | (_| | | | | |_) | (_| | (__|   <  __/ | | | (_| |
 |______|_| |_| |_|\__,_|_|_| |____/ \__,_|\___|_|\_\___|_| |_|\__,_|
                                                                     
*/

export const getUserEmails = async userId => {
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Accept", "text/plain");

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    fetch(`${window.API_SIGN_GATEWAY}/CertifiedEmails/${userId}`, requestOptions)
      .then(response => response.json())
      .then(result => resolve(result))
      .catch(error => {
        console.log('error', error);
        reject(error);
      });
  })
};

// Creates a new user with empty signatures or with a new signature
export const createUserEmail = async (userId, brandings = [], certifiedEmails = []) => {
  var myHeaders = new Headers();
    myHeaders.append("Accept", "text/plain");
    myHeaders.append("Content-Type", "application/json-patch+json");
    myHeaders.append("Content-Type", "text/plain");

  var raw = `{
  \n  "user\": \"${userId}\",
  \n  \"brandings\": ${JSON.stringify(brandings)},
  \n  \"certifiedEmails\": ${JSON.stringify(certifiedEmails)}
  \n}`;

  console.log("Este es el raw de CreateUser Email");
  console.log(raw);
  console.log({raw});

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch(`${window.API_SIGN_GATEWAY}/CertifiedEmails/addUser`, requestOptions)
    .then(response => {
      console.log(response);
      response.text()
    })
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}

// Adds or updates a signature of a given user
export const addOrUpdateEmail = async (userId, externalId, guid, app, createdAt, type, certificates) => {
  var myHeaders = new Headers();
  myHeaders.append("Accept", "text/plain");
  myHeaders.append("Content-Type", "application/json-patch+json");
  myHeaders.append("Content-Type", "text/plain");

  var raw = `{
    \n  \"guid\": \"${guid}\",
    \n  \"externalId\": \"${externalId}\",
    \n  \"app\": \"${app}\",
    \n  \"created_at\": \"${createdAt}\",
    \n  \"type\": \"${type}\",
    \n  \"certificate\": ${JSON.stringify(certificates)}
    \n}`;

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch(`${window.API_SIGN_GATEWAY}/CertifiedEmails/${userId}/email/addorupdate`, requestOptions)
    .then(response => {
      console.log(response);
      response.text()
    })
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}

export const addOrUpdateBrandingEmail = async (user, brandingInfo) => {
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Accept", "text/plain");
    myHeaders.append("Content-Type", "application/json-patch+json");
    myHeaders.append("Content-Type", "text/plain");

    var raw = `${JSON.stringify(brandingInfo)}`;
    // \n	\"app\": \"${brandingInfo[0].app}\",
    // \n	\"externalId\": "${brandingInfo[0].externalId}"
    // \n}`;

    console.log("Este es el raw de CreataddOrUpdateBrandingeEmail");
    console.log(raw);
    console.log({raw});

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    fetch(`${window.API_SIGN_GATEWAY}/CertifiedEmails/${user}/branding/addorupdate`, requestOptions)
      .then(response => {
        if (response.ok){
          return response.json()
        }
        else {
          throw new Error("Status:" + response.status + ' ' + " Headers:" + response.headers);
        }
      })
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


/*
   _____                 ____             _                  _ 
  / ____|               |  _ \           | |                | |
 | (___  _ __ ___  ___  | |_) | __ _  ___| | _____ _ __   __| |
  \___ \| '_ ` _ \/ __| |  _ < / _` |/ __| |/ / _ \ '_ \ / _` |
  ____) | | | | | \__ \ | |_) | (_| | (__|   <  __/ | | | (_| |
 |_____/|_| |_| |_|___/ |____/ \__,_|\___|_|\_\___|_| |_|\__,_|
                                                                                                                           
*/

export const getUserSms = async userId => {
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Accept", "text/plain");

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    fetch(`${window.API_SIGN_GATEWAY}/CertifiedSms/${userId}`, requestOptions)
      .then(response => response.json())
      .then(result => resolve(result))
      .catch(error => {
        console.log('error', error);
        reject(error);
      });
  })
};

// Creates a new user with empty signatures or with a new signature
export const createUserSms = async (userId, certifiedSms = []) => {
  var myHeaders = new Headers();
    myHeaders.append("Accept", "text/plain");
    myHeaders.append("Content-Type", "application/json-patch+json");
    myHeaders.append("Content-Type", "text/plain");

  var raw = `{
  \n  "user\": \"${userId}\",
  \n  \"certifiedSms\": ${JSON.stringify(certifiedSms)}
  \n}`;

  console.log("Este es el raw de CreateUserSms");
  console.log(raw);
  console.log({raw});

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch(`${window.API_SIGN_GATEWAY}/CertifiedSms/addUser`, requestOptions)
    .then(response => {
      console.log(response);
      response.text()
    })
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}

// Adds or updates a sms of a given user
export const addOrUpdateSms = async (userId, externalId, guid, app, createdAt, type, certificates) => {
  var myHeaders = new Headers();
  myHeaders.append("Accept", "text/plain");
  myHeaders.append("Content-Type", "application/json-patch+json");
  myHeaders.append("Content-Type", "text/plain");

  var raw = `{
    \n  \"guid\": \"${guid}\",
    \n  \"externalId\": \"${externalId}\",
    \n  \"app\": \"${app}\",
    \n  \"created_at\": \"${createdAt}\",
    \n  \"type\": \"${type}\",
    \n  \"certificate\": ${JSON.stringify(certificates)}
    \n}`;

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch(`${window.API_SIGN_GATEWAY}/CertifiedSms/${userId}/sms/addorupdate`, requestOptions)
    .then(response => {
      console.log(response);
      response.text()
    })
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}

// END OF LEFEBVRE SIGNATURE API CALLS


/*
  LEFEBVRE SIGNATURE BACKEND GATEWAY SIGNATURIT API CALLS
*/
/*
   _____ _                   _              _ _               _____ _                   _                       
  / ____(_)                 | |            (_) |             / ____(_)                 | |                      
 | (___  _  __ _ _ __   __ _| |_ _   _ _ __ _| |_   ______  | (___  _  __ _ _ __   __ _| |_ _   _ _ __ ___  ___ 
  \___ \| |/ _` | '_ \ / _` | __| | | | '__| | __| |______|  \___ \| |/ _` | '_ \ / _` | __| | | | '__/ _ \/ __|
  ____) | | (_| | | | | (_| | |_| |_| | |  | | |_            ____) | | (_| | | | | (_| | |_| |_| | | |  __/\__ \
 |_____/|_|\__, |_| |_|\__,_|\__|\__,_|_|  |_|\__|          |_____/|_|\__, |_| |_|\__,_|\__|\__,_|_|  \___||___/
            __/ |                                                      __/ |                                    
           |___/                                                      |___/                                     

*/

// Preloads all signatures associated with an account calling internal proxy api
export function preloadSignatures2(dispatch, filters, auth) {
  return new Promise((resolve, reject) => {

    let offset = 0;

    getSignatures(filters, auth, offset)
    .then(signatures => {
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

export const getSignatures = async (filters, auth, offset, signatures = []) => {
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `${auth}`);

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    fetch(`${window.API_SIGN_GATEWAY}/Signaturit/signatures/getSignatures/${filters}&offset=${offset}`, requestOptions)
      .then(response => response.json())
      .then(result => {
        console.log(result);
        signatures = signatures.concat(result);
        if (result.length === 100){
          resolve(getSignatures(filters, auth, offset + result.length, signatures));
        } else {
          // console.log('Datos recibidos de signaturit - GetSignatures:');
          // console.log({signatures});
          // signatures = calculateStatus(signatures);
          // console.log({signatures});
          // dispatch(preDownloadSignatures(signatures));
          resolve(signatures);
        }
      })
      .catch(error => {
        console.log('error', error);
        reject(error);
      });
  })
}

export const getCertifiedEmails = async () => {
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer dUOCDEBBbBfZlycygqbVpRhToLHIzSAxmzdZsUrrhBkRwStavdTLMrMBYACZUckFMbNrwFFmWLUqLmhxxuahvy");
    
    var formdata = new FormData();
    
    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      body: formdata,
      redirect: 'follow'
    };
    
    fetch("https://api.sandbox.signaturit.com/v3/emails.json", requestOptions)
      .then(response => response.json())
      .then(result => resolve(result))
      .catch(error => reject('error', error));
  })
}

// Creates a new signature calling internal proxy api
//export const createSignature2 = async (recipients, subject, body, files, filesData, reminders, expiration, lefebvreId, guid, brandingId, auth) => {
  export const createSignature2 = async (recipients, cc, subject, body, files, pagesConfig, reminders, expiration, lefebvreId, guid, brandingId, auth, roles) => {
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
    var rolesConfig = '';

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

    jsonObject.recipients = recipients;

    cc.forEach(recipient => {
      ccData.push({name: recipient.address.split('@')[0], email: recipient.address})
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

    //Roles config:
    recipients.forEach((recipient, i) => {
      rolesConfig += `${recipient.name}:${i}:${recipient.role}:${recipient.signatureType}:${recipient.doubleAuthType}:${recipient.doubleAuthInfo}|`;
    });
    console.log('Roles Config:' + rolesConfig);

    customFieldsData.push({name: "lefebvre_id", value: lefebvreId});
    customFieldsData.push({name: "lefebvre_guid", value: guid});
    customFieldsData.push({name: "subject", value: subject});
    customFieldsData.push({name: "body", value: body});
    customFieldsData.push({name: "reminders", value: remindConfig});
    customFieldsData.push({name: "expiration", value: expirationConfig});
    customFieldsData.push({name: "roles", value: rolesConfig})
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

    fetch(`${window.API_SIGN_GATEWAY}/Signaturit/signatures/newSignature`, requestOptions)
      .then(response => {
        if (response.ok){
          return response.json();
        } else {
          return response.text();
        }
      })
      .then(result => {
        console.log(result)
        resolve(result)
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

    fetch(`${window.API_SIGN_GATEWAY}/Signaturit/signatures/download/${signId}/signedDocument/${docId}`, requestOptions)
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

  fetch(`${window.API_SIGN_GATEWAY}/Signaturit/signatures/download/${signId}/trailDocument/${docId}`, requestOptions)
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

// Downloads the attachments information of a signed document calling internal proxy api
export const downloadAttachments2 = (signId, docId, fileName, auth) => {
  var myHeaders = new Headers();
  myHeaders.append("Authorization", `${auth}`);

  console.log(`https://api.sandbox.signaturit.com/v3/signatures/${signId}/documents/${docId}/download/attachments`);

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  fetch(`${window.API_SIGN_GATEWAY}/Signaturit/signatures/download/${signId}/attachments/${docId}`, requestOptions)
    .then(response => response.blob())
    .then(blob => {
      console.log(blob);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'photos-('+fileName+').zip');
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

  fetch(`${window.API_SIGN_GATEWAY}/Signaturit/signatures/reminder/${signatureId}`, requestOptions)
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

    fetch(`${window.API_SIGN_GATEWAY}/Signaturit/signatures/cancelSignature/${signatureId}`, requestOptions)
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
      request_expired:  template.templates.request_expired,
      emails_request : (template.templates.emails_request) ? template.templates.emails_request : ""
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

    fetch(`${window.API_SIGN_GATEWAY}/Signaturit/signatures/newBranding`, requestOptions)
      .then(response => {
        if (response.ok){
          return response.json();
        }
        else {
          return response.text();//reject(response.text());
        }
      })
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
   _____ _                   _              _ _              ______                 _ _     
  / ____(_)                 | |            (_) |            |  ____|               (_) |    
 | (___  _  __ _ _ __   __ _| |_ _   _ _ __ _| |_   ______  | |__   _ __ ___   __ _ _| |___ 
  \___ \| |/ _` | '_ \ / _` | __| | | | '__| | __| |______| |  __| | '_ ` _ \ / _` | | / __|
  ____) | | (_| | | | | (_| | |_| |_| | |  | | |_           | |____| | | | | | (_| | | \__ \
 |_____/|_|\__, |_| |_|\__,_|\__|\__,_|_|  |_|\__|          |______|_| |_| |_|\__,_|_|_|___/
            __/ |                                                                           
           |___/                                                                            

*/
// Retrieves all certified emails from Signaturit
export function preloadEmails(dispatch, filters, auth) {
  return new Promise((resolve, reject) => {

    let offset = 0;

    getEmails(filters, auth, offset)
    .then(emails => {
      console.log('Emails Before:')
      console.log(emails);
      emails = calculateStatusEmails(emails);
      console.log('Emails After:')
      console.log({emails});
      var sortedEmails = emails.sort((a,b) => (a.created_at > b.created_at) ? -1 : ((b.created_at > a.created_at) ? 1 : 0));
      dispatch(preDownloadEmails(sortedEmails));
      resolve(sortedEmails);
    })
    .catch(error => {
      console.log('error', error);
      reject(error);
    });
  })
}

export const getEmails = async (filters, auth, offset, emails = []) => {
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `${auth}`);

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    fetch(`${window.API_SIGN_GATEWAY}/Signaturit/emails/getEmails/${filters}&offset=${offset}`, requestOptions)
      .then(response => response.json())
      .then(result => {
        console.log(result);
        emails = emails.concat(result);
        if (result.length === 100){
          resolve(getEmails(filters, auth, offset + result.length, emails));
        } else {
          // console.log('Datos recibidos de signaturit - GetSignatures:');
          // console.log({signatures});
          // signatures = calculateStatus(signatures);
          // console.log({signatures});
          // dispatch(preDownloadSignatures(signatures));
          resolve(emails);
        }
      })
      .catch(error => {
        console.log('error', error);
        reject(error);
      });
  })
}

// Creates a new email calling internal proxy api
export const createEmail = async (recipients, cc, subject, body, files, lefebvreId, guid, type, brandingId, auth) => {
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

      recipients.forEach(recipient => {
        recipientsData.push({name: ' ', email: recipient.address})
      })
      jsonObject.recipients = recipientsData;
    
      // cc.forEach(recipient => {
      //   ccData.push({name: ' ', email: recipient.address})
      // });
      jsonObject.cc = ccData;

      files.forEach(file => {
        filesData.push({file: file.content, fileName: file.fileName})
      })
      jsonObject.files = filesData;

      jsonObject.certificationType = type;
  
  
      customFieldsData.push({name: "lefebvre_id", value: lefebvreId});
      customFieldsData.push({name: "lefebvre_guid", value: guid});
      customFieldsData.push({name: "subject", value: subject});
      customFieldsData.push({name: "body", value: body});
      customFieldsData.push({name: "certification_type", value: type})
      jsonObject.customFields = customFieldsData;
  
      jsonObject.subject = subject;
      jsonObject.body = body;
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
  
      fetch(`${window.API_SIGN_GATEWAY}/Signaturit/emails/newEmail`, requestOptions)
        .then(response => {
          if (response.ok){
            return response.json();
          } else {
            throw `${response.text()}`;
          }
        })
        .then(result => {
          console.log(result)
          resolve(result)
        })
        .catch(error => {
          console.log('error', error);
          reject(error);
        });
    })
}
  
// Downloads the trail information of a certified email calling internal proxy api
export const downloadCertificationDocument = (emailId, certificationId, fileName, auth) => {
  var myHeaders = new Headers();
  myHeaders.append("Authorization", `${auth}`);

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  fetch(`${window.API_SIGN_GATEWAY}/Signaturit/emails/download/${emailId}/certificate/${certificationId}`, requestOptions)
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

/*

   _____ _                   _              _ _               _____               
  / ____(_)                 | |            (_) |             / ____|              
 | (___  _  __ _ _ __   __ _| |_ _   _ _ __ _| |_   ______  | (___  _ __ ___  ___ 
  \___ \| |/ _` | '_ \ / _` | __| | | | '__| | __| |______|  \___ \| '_ ` _ \/ __|
  ____) | | (_| | | | | (_| | |_| |_| | |  | | |_            ____) | | | | | \__ \
 |_____/|_|\__, |_| |_|\__,_|\__|\__,_|_|  |_|\__|          |_____/|_| |_| |_|___/
            __/ |                                                                 
           |___/                                                                  

*/

export function preloadSms(dispatch, filters, auth) {
  return new Promise((resolve, reject) => {

    let offset = 0;

    getSms(filters, auth, offset)
    .then(sms => {
      console.log('Sms Before:')
      console.log(sms);
      //console.log(JSON.parse(fakedata));
      fakedata.forEach(data => {
        sms.push(data);
      });
      
      sms = calculateStatusSms(sms);
      console.log('sms After:')
      console.log({sms});
      var sortedSms = sms.sort((a,b) => (a.created_at > b.created_at) ? -1 : ((b.created_at > a.created_at) ? 1 : 0));
      dispatch(preDownloadSmsList(sortedSms));
      resolve(sortedSms);
    })
    .catch(error => {
      console.log('error', error);
      reject(error);
    });
  })
}

export const getSms = async (filters, auth, offset, sms = []) => {
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `${auth}`);

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    fetch(`${window.API_SIGN_GATEWAY}/Signaturit/sms/getSms/${filters}&offset=${offset}`, requestOptions)
      .then(response => response.json())
      .then(result => {
        console.log(result);
        sms = sms.concat(result);
        if (result.length === 100){
          resolve(getSms(filters, auth, offset + result.length, emails));
        } else {
          // console.log('Datos recibidos de signaturit - GetSignatures:');
          // console.log({signatures});
          // signatures = calculateStatus(signatures);
          // console.log({signatures});
          // dispatch(preDownloadSignatures(signatures));
          resolve(sms);
        }
      })
      .catch(error => {
        console.log('error', error);
        reject(error);
      });
  })
}

// Creates a new sms calling internal proxy api
export const createSms = async (recipients, body, files, lefebvreId, guid, type, auth, validPhoneNumbers) => {
    return new Promise((resolve, reject) => {
      var myHeaders = new Headers();
      myHeaders.append("Accept", "text/plain");
      myHeaders.append("Content-Type", "application/json-patch+json");
      myHeaders.append("Content-Type", "text/plain");
      myHeaders.append("Authorization", `${auth}`);
  
      var jsonObject = {};
      var recipientsData = [];
      var filesData = [];
      var customFieldsData = [];
      var userAdditionalInfo = '';

      recipients.forEach((recipient, i) => {
        var name = (recipient.name === null || recipient.name === undefined || recipient.name === '') ? '' : recipient.name;
        var email = (recipient.email === null || recipient.email === undefined || recipient.email === '') ? '' : recipient.email;
        var phone = validPhoneNumbers[i].normalizedPhone;
        recipientsData.push({name: name, phone: phone})
        userAdditionalInfo += `i=${i}:phone=${validPhoneNumbers[i].cleanPhone}:name=${(recipient.name === '') ? '-' : name}:email=${(recipient.email === '') ? '-' : email}|`
      })
      jsonObject.recipients = recipientsData;
    
      files.forEach(file => {
        filesData.push({file: file.content, fileName: file.fileName})
      })
      jsonObject.files = filesData;

      jsonObject.certificationType = type;
  
  
      customFieldsData.push({name: "lefebvre_id", value: lefebvreId});
      customFieldsData.push({name: "lefebvre_guid", value: guid});
      customFieldsData.push({name: "body", value: body.innerText});
      customFieldsData.push({name: "certification_type", value: type});
      customFieldsData.push({name: "additional_info", value: userAdditionalInfo})
      jsonObject.customFields = customFieldsData;
  
      jsonObject.body = (type === 'open_document' || type === 'open_every_document') ? `${body.innerText} {{short_url}}` : body.innerText;  
  
      var raw = JSON.stringify(jsonObject);
      console.log('Raw::');
      console.log(raw);
      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
      };
  
      fetch(`${window.API_SIGN_GATEWAY}/Signaturit/sms/newSms`, requestOptions)
        .then(response => {
          if (response.ok){
            return response.json();
          } else {
            return response.text();
          }
        })
        .then(result => {
          console.log(result)
          resolve(result)
        })
        .catch(error => {
          reject(error);
          console.log('error', error)
        });
    })
}
  
// Downloads the trail information of a certified sms calling internal proxy api
export const downloadSmsCertificationDocument = (smsId, certificationId, fileName, auth) => {
  var myHeaders = new Headers();
  myHeaders.append("Authorization", `${auth}`);

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  fetch(`${window.API_SIGN_GATEWAY}/Signaturit/sms/download/${smsId}/certificate/${certificationId}`, requestOptions)
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
  let numSigning = 0;
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
        case 'signing':
          numSigning += 1;
          break;
        default:
          break;
      }
    })
    console.log('NumSigners: '+ numSigners);
    if (numSigners === numCompleted){
      signature.status = 'completed';
    } else if (numSigners > 0 && numCompleted < numSigners && numCancelled === 0 && numRejected === 0 && numExpired === 0 && numInQueue === 0 && numSigning === 0 && numError === 0){
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
    } else if (numSigners > 0 && numSigning > 0){
      signature.status = 'signing'
    }
    numSigners = 0;
    numCompleted = 0;
    numInProgress = 0;
    numCancelled = 0;
    numRejected = 0;
    numExpired = 0;
    numError = 0;
    numInQueue = 0;
    numSigning = 0;
  })
  console.log("Signatures after: ");
  console.log({signatures});
  return signatures;
};

const getRecipientsEmail= (email) => {
  var lookup = {};
  var items = email.certificates;
  var result = [];

  for (var item, i = 0; item = items[i++];) {
    var name = item.email;

    if (!(name in lookup)) {
      lookup[name] = 1;
      result.push(name);
    }
  }
  return result;
}

const getRecipientsSms= (sms) => {
  var lookup = {};
  var items = sms.certificates;
  var result = [];

  for (var item, i = 0; item = items[i++];) {
    var phone = item.phone;

    if (!(phone in lookup)) {
      lookup[phone] = 1;
      result.push(phone);
    }
  }
  return result;
}

const getDocumentsCertification = (emailOrSms) => {
  var documents = [];
  emailOrSms.certificates.forEach(certificate => {
    if (!documents.find(document => document == JSON.stringify(certificate.file))){
      if (certificate.file !== undefined){
        documents.push(JSON.stringify(certificate.file));
      }
    }
  });
  return documents;
}

const countCertificationEvents = (emailOrSms) => {
  var counter = 0;
  emailOrSms.certificates.forEach(certificate => {
    if (certificate.events.find(ev => ev.type == "certification_completed")){
      counter++;
    }
  });
  return counter;
}

const countErrorEvents = (emailOrSms) => {
  var counter = 0;
  emailOrSms.certificates.forEach(certificate => {
    if (certificate.status === 'error'){
      counter++;
    }
  });
  return counter;
}

const countDistinctEmails = (email) => {
  var distinctEmails = getRecipientsEmail(email)
  return distinctEmails.length;
}

const countDistinctSms = (sms) => {
  var distinctPhones = getRecipientsSms(sms)
  return distinctPhones.length;
}

const countDistinctDocuments = (emailOrSms) => {
  var distinctDocuments = getDocumentsCertification(emailOrSms)
  return distinctDocuments.length;
}

const calculateStatusEmails = (emails) => {
  // To do
  emails.forEach(email => {
    var numNodes = email.certificates.length;
    var numRecipients = countDistinctEmails(email);
    var numDocuments = countDistinctDocuments(email);
    var numCertifiedEvents = countCertificationEvents(email);
    var numErrorEvents = countErrorEvents(email);

    numDocuments = (numDocuments === 0) ? 1 : numDocuments;

    if (numErrorEvents > 0){
      email.status = 'error'
    } else if (numCertifiedEvents == numRecipients && numNodes == numRecipients * numDocuments){
      email.status = 'completed'
    } else {
      email.status = 'ready'
    }

  })
  return emails
}

const calculateStatusSms = (smsList) => {
  smsList.forEach(sms => {
    var numNodes = sms.certificates.length;
    var numRecipients = countDistinctSms(sms);
    var numDocuments = countDistinctDocuments(sms);
    var numCertifiedEvents = countCertificationEvents(sms);
    var numErrorEvents = countErrorEvents(sms);
  
    numDocuments = (numDocuments === 0) ? 1 : numDocuments;

    if (numErrorEvents > 0){
      sms.status = 'error'
    } else if (numCertifiedEvents == numRecipients && numNodes == numRecipients * numDocuments){
      sms.status = 'completed'
    } else {
      sms.status = 'ready'
    }

  })
  return smsList
}

// END HELPER FUNCTIONS


export const getUser = async userId => {
    const url = `${window.URL_GET_ACCOUNTS}/${userId}`;
    const url2 = `${window.API_GATEWAY_LEX}/api/v1/lex/Lexon/user?idUserNavision=${userId}`;

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

    fetch(`${window.API_GATEWAY_LEX}/api/v1/lex/Lexon/entities/files/get`, requestOptions)
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

    fetch(`${window.API_GATEWAY_CEN}/api/v1/cen/concepts/files/get?idNavisionUser=${userId}&idDocument=${attachmentId}`, requestOptions)
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
    fetch(`${window.API_GATEWAY_CEN}/api/v1/cen/signatures/cancelation/${guid}`, requestOptions)
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

export const notifyCen = async (service, guid, docId, recipients) => {
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Accept", "text/plain");
    myHeaders.append("Content-Type", "application/json-patch+json");

    var recipientsData = [];

    recipients.forEach(recipient => {
      (service === 'signature') 
        ? recipientsData.push({name: recipient.name, email: recipient.email})
        : recipientsData.push({name: recipient.name, email: recipient.address})
    });

    var raw = JSON.stringify(recipientsData);

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    }
    // localhost: https://localhost:44331/api/v1/Centinela
    fetch(`${window.API_GATEWAY_CEN}/api/v1/cen/signatures/notify/${service}/${guid}/${docId}`, requestOptions)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        return response.text();
      }
    })
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

export const getContactsCentinela = async(user) => {
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Accept", "text/plain");

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    fetch(`${window.API_GATEWAY_CEN}/api/v1/cen/contacts?idNavisionUser=${user}`, requestOptions)
    .then(response => {
      if (response.ok){
        return response.json();
      } else {
        return response.text()
      }}
    )
    .then(result => {
      console.log(result);
      resolve(result);
    })
    .catch(error => {
      console.log('error', error);
      reject(error);
    });
  });
}

export const getContactsLexon = async(user, db, env) => {
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Accept", "text/plain");
    myHeaders.append("Content-Type", "application/json-patch+json");

    var raw = JSON.stringify({bbdd: db, idUser: user});

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    }

    fetch(`${window.API_GATEWAY_LEX}/api/v1/lex/Lexon/classifications/contact/all`, requestOptions)
    .then(response => {
      if (response.ok){
        return response.json();
      } else {
        throw `${response.text()}`;
      }}
    )
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

export const getBBDDLexon = async (user, env) => {
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Accept", "text/plain");

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    }

    fetch(`${window.API_GATEWAY_LEX}/api/v1/lex/Lexon/user?idUserNavision=${user}`, requestOptions)
    .then(response => {
      if (response.ok){
        return response.json();
      } else {
        throw `${response.text()}`;
      }}
    )
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
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Accept", "text/plain");

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    fetch(`${window.API_UTILS_GATEWAY}/firm/client/${companyId}/numdocs/${numDocuments}/check`, requestOptions)
      .then(response => response.json())
      .then(result => resolve(result))
      //.then(result =>  resolve(true)) // Se pone para pruebas
      .catch(error => {
        console.log('error', error);
        reject(error);
      });
  })
}

export const getNumAvailableSignatures = async (companyId) => {
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Accept", "text/plain");

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    fetch(`${window.API_UTILS_GATEWAY}/firm/client/${companyId}/checkAvailable`, requestOptions)
      .then(response => response.json())
      .then(result => resolve(result))
      .catch(error => {
        console.log('error', error);
        reject(error);
      });
  })
}

export const notifySignature = async (userId, companyId, numDocuments) => {
  return new Promise((resolve, reject) => {

    var requestOptions = {
      method: 'POST',
      redirect: 'follow'
    };

    fetch(`${window.API_UTILS_GATEWAY}/firm/client/${companyId}/user/${userId}/numdocs/${numDocuments}/add`, requestOptions)
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

export const verifyJwtSignature = async(token) => {
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Accept", "text/plain");
    myHeaders.append("Content-Type", "application/json-patch+json");

    var requestOptions = {
      method: 'PUT',
      headers: myHeaders,
      body: `"${token}"`,
      redirect: 'follow'
    };

    fetch(`${window.API_GATEWAY_LEX}/api/v1/utils/Lexon/token/validation?validateCaducity=false`, requestOptions)
    .then(response => {
      if (response.ok){
        return response.json();
      } else {
        return response.json();
      }}
    )
    .then(result => {
      console.log(result);
      resolve(result.data.valid);
    })
    .catch(error => {
      console.log('error', error);
      reject(error);
    });
  })
}

export const getSignedToken = async (user, password) => {
  return new Promise((resolve, reject) => {
    // var myHeaders = new Headers();
    // myHeaders.append("Accept", "text/plain");
    // myHeaders.append("Content-Type", "multipart/form-data");

    var formdata = new FormData();
    
    formdata.append(`login`, user);
    formdata.append(`password`, password);
    formdata.append("idApp", 0);
    formdata.append("addTerminatorToToken", true);
      

    var requestOptions = {
      method: 'POST',
      //headers: myHeaders,
      body: formdata,
      redirect: 'follow'
    };

    fetch(`${window.API_UTILS_GATEWAY}/token`, requestOptions)
    .then(response => {
      if (response.ok){
        return response.json();
      } else {
        return response.json()
      }}
    )
    .then(result => {
      console.log(result);
      resolve(result);
    })
    .catch(error => {
      console.log('error', error);
      reject(error);
    });
  });
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