import CryptoJS from 'crypto-js';

export const base64Decode = () => {
    const userToken = JSON.parse(localStorage.getItem('auth-centinela')); 
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
  documentId,
  navisionUser
) => {
  const url = `${API_GATEWAY}/concepts/files/get?idNavisionUser=${navisionUser}&idDocument=${documentId}`;
  console.log('aqui', url);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/text',
        'Content-Type': 'application/json'
      }
    });
    console.log('response', response);
    if (response.status !== 200) {
      return response;
    }

    if (response && response.headers) {
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
    }
  } catch (err) {
    throw err;
  }
};
