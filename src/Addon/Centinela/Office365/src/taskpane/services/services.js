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
  console.log(addonData.idClienteNav, addonData.provider, addonData.account, addonData.messageById);
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
