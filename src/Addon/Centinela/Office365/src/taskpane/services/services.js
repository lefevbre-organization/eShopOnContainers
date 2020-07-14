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