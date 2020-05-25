import { preDownloadSignatures } from '../actions/application';

  
export const getUserSignatures = async userId => {
  var myHeaders = new Headers();
  myHeaders.append("Accept", "text/plain");
  
  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };
  
  fetch(`${window.URL_SIGNATURES_API}/${userId}`, requestOptions)
    .then(response => response.json())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
  };


export const createUser = async userId => {
  var myHeaders = new Headers();
    myHeaders.append("Accept", "text/plain");
    myHeaders.append("Content-Type", "application/json-patch+json");
    myHeaders.append("Content-Type", "text/plain");

  var raw = `{
  \n  "user\": \"${userId}\",
  \n  \"signatures\": []
  \n}`;

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch(`${window.URL_SIGNATURES_API}`, requestOptions)
    .then(response => {
      console.log(response);
      response.text()
    })
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}

export const addOrUpdateSignature = async (userId, externalId, guid, app) => {
  var myHeaders = new Headers();
  myHeaders.append("Accept", "text/plain");
  myHeaders.append("Content-Type", "application/json-patch+json");
  myHeaders.append("Content-Type", "text/plain");

  var raw = `{
  \n  \"externalId\": \"${externalId}\",
  \n  \"guid\": \"${guid}\",
  \n  \"app\": \"${app}\"
  \n}`;

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch(`${window.URL_SIGNATURES_API}/${userId}/signature/addorupdate`, requestOptions)
    .then(response => {
      console.log(respose);
      response.text()
    })
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}

export const deleteUser = async userId => {
  var myHeaders = new Headers();
  myHeaders.append("Accept", "text/plain");
  myHeaders.append("Content-Type", "application/json-patch+json");

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    redirect: 'follow'
  };

  fetch(`${window.URL_SIGNATURES_API}/${userId}/delete`, requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}