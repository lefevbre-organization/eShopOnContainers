var nameFolder = "";
var messageRawResponse = [];

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

function getHeaderId(thread){
    var response = Gmail.Users.Threads.get('me', thread.getId());
    for (var i = 0; i < response.messages.length; i++) {
     for (var j = 0; j < response.messages[i].payload.headers.length; j++) {
         if(response.messages[i].payload.headers[j].name == "Message-ID" || 
            response.messages[i].payload.headers[j].name == "Message-Id") {
            return response.messages[i].payload.headers[j].value;
         }
       }
    }
  
}

function getAddonData(e) {
    var user = JSON.parse(cache.get('dataUser'));
    var messageDataId = e.messageMetadata.messageId;
    var thread = GmailApp.getMessageById(messageDataId).getThread();
    var subject = thread.getFirstMessageSubject();
    var messageDate = thread.getLastMessageDate();
    var account = Session.getEffectiveUser().getEmail();
    var message = GmailApp.getMessageById(messageDataId);
    var raw = GmailApp.getMessageById(messageDataId).getRawContent();
    getNameFolder(message);
    
    var messageId = getHeaderId(thread);
    
    var addonData = {
      account: account,
      provider: 'GOOGLE',
      messageId: messageId,
      messageById: thread.getId(),
      subject: subject,
      folder: nameFolder,
      sentDateTime: messageDate,
      idUser: user.idUserApp,
      idClienteNav: user.idClienteNavision,
      userName: user.name,
      email: user.login,
      addonType: 'MessageRead'
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