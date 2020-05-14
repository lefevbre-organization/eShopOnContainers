var nameEntityType = "";
var companyResponse = [];
var classificationsResponse = [];
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

function getAddonData(e) {
  var user = JSON.parse(cache.get('dataUser'));
  var companyData = JSON.parse(cache.get('companyData'));
  var messageId = e.messageMetadata.messageId;
  var thread = GmailApp.getMessageById(messageId).getThread();
  var subject = thread.getFirstMessageSubject();
  var messageDate = thread.getLastMessageDate();
  var raw = GmailApp.getMessageById(messageId).getRawContent()
  
  var header = {
    alg: "HS256",
    typ: "JWT",
  }; 
    
  var addonData = {
    idCompany: companyData.idCompany,
    bbdd: companyData.bbdd,
    name: companyData.name,
    account: companyData.account,
    provider: 'GOOGLE',
    messageId: messageId,
    subject: subject,
    folder: 'Inbox',
    sentDateTime: messageDate,
    idUser: user.data.idUser,
    userName: user.data.name
  };

  // var url = apiEndpoint + "";
  // var data = {
  //     'idUser': addonData.idUser,
  //     'account': addonData.account,
  //     'provider': addonData.provider,
  //     'messageId': addonData.messageId,
  //     'raw': raw
  // };
  // var options = {
  //     'method': "post",
  //     'contentType': 'application/json',
  //     'payload': JSON.stringify(data),
  //     'muteHttpExceptions': true
  // };
  // var response = UrlFetchApp.fetch(url, options);
  
  var signature = Utilities.base64Encode(JSON.stringify(header)) + "." 
    + Utilities.base64Encode(JSON.stringify(addonData));
  
  var jwt = signature + "." + 
    Utilities.base64Encode(
      Utilities.computeHmacSha256Signature(signature, key)
    );

  cache.put('getAddonData', JSON.stringify(addonData), 21600);
  
  cache.put('token', jwt, 21600);
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