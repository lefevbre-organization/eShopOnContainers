import CryptoJS from 'crypto-js';

export const getCompanies = () => {
   return new Promise((resolve, reject) => {
     const url = `${window.API_GATEWAY}/lex/Lexon/companies`;   
     fetch(url, {
       method: 'GET',
       headers: {
         Accept: 'text/plain',
       },
     })
       .then((data) => data.json())
       .then((result) => {
         resolve({
           companies: result.data,
           errors: result.errors,
         });
       })
       .catch((error) => {
         reject(error);
       });
   });

}

export const base64Decode = () => {
    const userToken = JSON.parse(localStorage.getItem('auth-lexon')); 
    const payload = userToken.data.token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
     }).join(''));
    return JSON.parse(jsonPayload);
}

export const base64url = (source) => {
  // Encode in classical base64
 let encodedSource = CryptoJS.enc.Base64.stringify(source);

  // Remove padding equal characters
  encodedSource = encodedSource.replace(/=+$/, '');

  // Replace characters according to base64url specifications
  encodedSource = encodedSource.replace(/\+/g, '-');
  encodedSource = encodedSource.replace(/\//g, '_');

  return encodedSource;
}

export const getClassifications = async (
  user,
  bbdd,
  mailId,
  pageSize = 0,
  pageIndex = 1
) => {
  const url = `${window.API_GATEWAY}/lex/Lexon/classifications`;
  const body = {
    idMail: mailId,
    pageSize,
    pageIndex: 1,
    bbdd,
    idUser: user,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    return { classifications: result.data };
  } catch (err) {
    throw err;
  }
};

export const removeClassification = async (
  idMail,
  idType,
  bbdd,
  idUserApp,
  account,
  idRelated,
  idCompany
) => {
  const url = `${window.API_GATEWAY}/lex/Lexon/classifications/remove`;
  const body = {
    idMail: idMail,
    idType: idType,
    bbdd: bbdd,
    idUser: idUserApp,
    mailAccount: account,
    idRelated: idRelated,
    idCompany: idCompany,
    provider: 'OU'
  };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    if (
      result.errors.length > 0 ||
      (result.errors !== null &&
        result.errors !== undefined &&
        (result.data === null || result.data === undefined))
    ) {
      throw new Error(result.errors);
    } else {
      return { results: result.data };
    }
  } catch (err) {
    throw err;
  }
};

export const getRawAddon = async (
  addonData
) => {
  const url = `${window.URL_GET_ACCOUNTS}/${addonData.idClienteNav}/raw?`
  + 'provider='+ addonData.provider + '&account=' + 
  addonData.account +'&messageId=' + addonData.messageById;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
    });
    const result = await response.json();

    return { result };
  } catch (err) {
    throw err;
  }
};

export const saveMessageRaw = async (addonData, raw) => {
  const url = `${window.URL_GET_ACCOUNTS}/${addonData.idClienteNav}/raw`;

  const body = {
    id: null,
    user: addonData.idClienteNav,
    account: addonData.account,
    provider: addonData.provider,
    messageId: addonData.messageById,
    raw: raw
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/text',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return { response };
  } catch (err) {
    throw err;
  }
}

export const removeRawAddon = async (addonData) => {
  const url = `${window.URL_GET_ACCOUNTS}/${addonData.idClienteNav}/raw/delete`;
  const body = {
    user: addonData.idClienteNav,
    account: addonData.account,
    provider: addonData.provider,
    messageId: addonData.messageById
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/text',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return { response };
  } catch (err) {
    throw err;
  }
}

export const downloadFile = async (
  idEntity,
  bbdd,
  idUser
) => {
  const url = `${window.API_GATEWAY}/lex/Lexon/entities/files/get`;
  const body = {
    idEntity,
    bbdd,
    idUser,
  };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/text',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (response.status !== 200) {
      return response;
    }

    const reader = response.body.getReader();
    let receivedLength = 0; // received that many bytes at the moment
    let chunks = []; // array of received binary chunks (comprises the body)

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      chunks.push(value);
      receivedLength += value.length;
    }

    let chunksAll = new Uint8Array(receivedLength); // (4.1)
    let position = 0;
    for (let chunk of chunks) {
      chunksAll.set(chunk, position); // (4.2)
      position += chunk.length;
    }

    let result = new TextDecoder('utf-8').decode(chunksAll);

    // We're done!
    let commits = JSON.parse(result);

    return { ...commits, status: 200 };
  } catch (err) {
    throw err;
  }
};
