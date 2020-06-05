var nameEntityType = "";
var nameFolder = "";
var companyResponse = [];
var classificationsResponse = [];
var messageRawResponse = [];
var classificationsDataResponse = null;
var classificationsDeleteResponse = null;

function getCompanyList() {
    var url = apiEndpoint + "companies";
      var response = UrlFetchApp.fetch(url, {
        method: "get",
        // headers: headers,
        muteHttpExceptions: true
      });
      var raw = response.getContentText();
      return companyResponse = JSON.parse(raw);
}

function getClassifications(messageId, bbdd, idUser) {
    var url = apiEndpoint + "classifications";
    var data = {
        'idMail': messageId,
        'pageSize': 0,
        'pageIndex': 1,
        'bbdd': bbdd,
        'idUser': idUser
    };
    var options = {
        'method': "post",
        'contentType': 'application/json',
        'payload': JSON.stringify(data),
        'muteHttpExceptions': true
    };
      var response = UrlFetchApp.fetch(url, options);
      var raw = response.getContentText();
      return classificationsResponse = JSON.parse(raw);
}

function getClassificationData(idType, idEntity, bbdd, idUser) {
  var url = apiEndpoint + "entities/getbyid";
  var data = {
      'idType': idType,
      'idEntity': idEntity,
      'bbdd': bbdd,
      'idUser': idUser
  };
  var options = {
      'method': "post",
      'contentType': 'application/json',
      'payload': JSON.stringify(data),
      'muteHttpExceptions': true
  };
    var response = UrlFetchApp.fetch(url, options);
    var raw = response.getContentText();
    return classificationsDataResponse = JSON.parse(raw);
}

function deleteClassification(idMail,
  idType,
  bbdd,
  user,
  idRelated,
  idCompany) {
  var url = apiEndpoint + "classifications/remove";
    var data = {
        'idMail': idMail,
        'idType': parseInt(idType),
        'bbdd': bbdd,
        'idUser': user.idUser,
        'idRelated': parseInt(idRelated),
        'idCompany': idCompany,
        'provider': user.provider, 
        'mailAccount': user.account
    };
    var options = {
        'method': "post",
        'contentType': 'application/json',
        'payload': JSON.stringify(data),
        'muteHttpExceptions': true
    };
      var response = UrlFetchApp.fetch(url, options);
      var raw = response.getContentText();
      return classificationsDeleteResponse = JSON.parse(raw);
}

function getNameFolder(folderMessage) { 
  if(folderMessage.isStarred()) {
    nameFolder = 'Destacados';
  } else if(folderMessage.isInChats()) {
    nameFolder = 'Conversación';
  } else if(folderMessage.isInTrash()) {
    nameFolder = 'Papelera';
  } else if(folderMessage.isInInbox()) {
    nameFolder = 'Recibidos';
  } else {
    nameFolder = 'Enviados';
  }
}

function getMessageRaw(addonData) {
  var queryString = '?provider='+ addonData.provider 
  + '&account='+ addonData.account +'&messageId=' 
  + addonData.messageById;
  var url = apiAccount + addonData.idClienteNav 
  + '/raw' + queryString;
  var response = UrlFetchApp.fetch(url, {
    method: "get",
    // headers: headers,
    followRedirects: true,
    muteHttpExceptions: true,
    escaping: true
  });
  var raw = response.getContentText();
  return messageRawResponse = JSON.parse(raw);
}

function saveMessageRaw(addonData, raw) {
  if(messageRawResponse.data != null) {
    return;
  }
  var url = apiAccount + addonData.idClienteNav + '/raw';
  var data = {
      'id': null,
      'user': addonData.idClienteNav,
      'account': addonData.account,
      'provider': addonData.provider,
      'messageId': addonData.messageById,
      'raw': raw
  };
  var options = {
      'method': "post",
      'contentType': 'application/json',
      'payload': JSON.stringify(data),
      'muteHttpExceptions': true
  };
  var saveResponse = UrlFetchApp.fetch(url, options);
}

function removeRawAddon(addonData) {
  const url = apiAccount + addonData.idClienteNav + '/raw/delete';
  const data = {
    'user': addonData.idClienteNav,
    'account': addonData.account,
    'provider': addonData.provider,
    'messageId': addonData.messageById
  };

  var options = {
    'method': "post",
    'contentType': 'application/json',
    'payload': JSON.stringify(data),
    'muteHttpExceptions': true
  };
  var deleteResponse = UrlFetchApp.fetch(url, options);
}


function getAddonData(e) {
  var user = JSON.parse(cache.get('dataUser'));
  var companyData = JSON.parse(cache.get('companyData'));
  var messageDataId = e.messageMetadata.messageId;
  var thread = GmailApp.getMessageById(messageDataId).getThread();
  var subject = thread.getFirstMessageSubject();
  var messageDate = thread.getLastMessageDate();
  var raw = GmailApp.getMessageById(messageDataId).getRawContent()
  var message = GmailApp.getMessageById(messageDataId);
  getNameFolder(message)
  
  var response = Gmail.Users.Messages.get('me', thread.getId())
  var messageId = "";
  for (var i = 0; i < response.payload.headers.length; i++) {
    if(response.payload.headers[i].name == "Message-ID" || 
      response.payload.headers[i].name == "Message-Id") {
      messageId = response.payload.headers[i].value;
    }
  }

  var addonData = {
    idCompany: companyData.idCompany,
    bbdd: companyData.bbdd,
    name: companyData.name,
    account: companyData.account,
    provider: 'GOOGLE',
    messageId: messageId,
    messageById: thread.getId(),
    subject: subject,
    folder: nameFolder,
    sentDateTime: messageDate,
    idUser: "449",
    idClienteNav: user.data._idClienteNav,
    userName: user.data._nombre,
    email: user.data._login
  };
  
  var header = {
    alg: "HS256",
    typ: "JWT",
  }; 
  
  var signature = Utilities.base64Encode(JSON.stringify(header)) + "." 
    + Utilities.base64Encode(JSON.stringify(addonData), Utilities.Charset.UTF_8);
  
  var jwt = signature + "." + 
    Utilities.base64Encode(
      Utilities.computeHmacSha256Signature(signature, key, Utilities.Charset.UTF_8)
    );

  cache.put('getAddonData', JSON.stringify(addonData), 85900);
  
  cache.put('token', jwt, 85900);
  
  getMessageRaw(addonData);
  saveMessageRaw(addonData, raw);
  
}

function getNameEntityType(entityType) {
    switch (entityType) {
      case "files":
        nameEntityType = "Expediente"
        break;
      case "clients":
        nameEntityType = "Clientes"
      break;
      case "opposites": 
        nameEntityType = "Contrarios"
      break;
      case "suppliers": 
        nameEntityType = "Proveedores"
      break;
      case "lawyers": 
        nameEntityType = "Abogados propios"
      break;
      case "opposingLawyers": 
        nameEntityType = "Abogados contrarios"
      break;
      case "solicitors": 
        nameEntityType = "Procuradores propios"
      break;
      case "opposingSolicitors": 
        nameEntityType = "Procuradores contrarios"
      break;
      case "notaries": 
        nameEntityType = "Notarios"
      break;
      case "courts": 
        nameEntityType = "Juzgados"
      break;
      case "insurances": 
        nameEntityType = "Aseguradores"
      break;
      case "others": 
        nameEntityType = "Otros"
      break;
      case "folders": 
        nameEntityType = "Carpetas"
      break;
      case "documents": 
        nameEntityType = "Documentos"
      break;
      default:
        nameEntityType = ""
        break;
    }
  }
