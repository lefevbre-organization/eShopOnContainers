import * as base64 from 'base-64';

export const parseJwt = token => {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    //verifyTokenSignature --> to be implemented
    console.log(JSON.parse(jsonPayload));
    return JSON.parse(jsonPayload);
}

export const getUserId = payload =>{
  return(payload.hasOwnProperty('idClienteNavision') ? payload.idClienteNavision : (payload.hasOwnProperty('idLexonUser')) ? payload.idLexonUser : (payload.hasOwnProperty('nameUser')) ? payload.nameUser : (payload.hasOwnProperty('userId')) ? payload.userId : null);
}

export const getIdCasefile = payload =>{
  return( (payload.hasOwnProperty('idEntityType') && payload.hasOwnProperty('idEntity'))  ? ((payload.idEntityType == 1) ? payload.idEntity : null) : null );
}

export const getBbdd = payload =>{
  return(payload.hasOwnProperty('bbdd') ? payload.bbdd : null);
}

export const getIdCompany = payload =>{
  return(payload.hasOwnProperty('company') ? payload.company : null);
}

export const getIdLexon = payload =>{
  return(payload.hasOwnProperty('idLexon') ? payload.idLexon : null);
}

export const getIdMail = payload =>{
  return(payload.hasOwnProperty('idMail') ? payload.idMail : null);
}

export const getImapFolder = payload =>{
  if (payload && payload.folder){
    if (payload.folder.indexOf("::") !== -1){
      return payload.folder.split("::")[1].toUpperCase();
    } else {
      return payload.folder.toUpperCase();
    }
  } else {
    return null;
  }
}

export const getIdEntityType = payload =>{
  return(payload.hasOwnProperty('idEntityType') ? payload.idEntityType : null);
}

export const getIdEntity = payload =>{
  return(payload.hasOwnProperty('idEntity') ? payload.idEntity : null);
}

export const getMailContacts = payload => {
  return(payload.hasOwnProperty('mailContacts') ? payload.mailContacts.toString() : null)
}

export const getUrlType = payload =>{
  if (payload.hasOwnProperty('idMail') && getIdCasefile(payload) == null){
    return "mailOnly";
  }
  else if (payload.hasOwnProperty('idMail') && getIdEntityType(payload) == 1){
    return "mailWithCaseFile"
  }
  else if (getIdEntityType(payload) !== null && getIdEntityType(payload) > 1 && getIdEntityType(payload) < 13 ){
    return "composeWithContacts"
  }
  else if (getIdCasefile(payload) != null){
    return "composeWithCaseFile";
  }
  else if (payload.hasOwnProperty('bbdd')){
    return "dbOnly";
  }
  else {
    return "default";
  }
}