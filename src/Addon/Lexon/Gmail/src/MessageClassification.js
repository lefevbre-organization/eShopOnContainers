  function showNewConection() {
  
    var addonData = cache.get('token');
  
    return ClassifyMessages.createService('lexon')
      .setAuthorizationBaseUrl(urlFrontend + 'lexon')
      .setAddonData(addonData)
      .setCallbackFunction('newConectionCallback')
      .setCache(CacheService.getUserCache())
      .setPropertyStore(PropertiesService.getUserProperties());
  }
  
  function newConectionCallback(callbackRequest) {
    Logger.log("Run newConectionCallback!");
    
    return HtmlService.createHtmlOutput('Success! <script>setTimeout(function() { top.window.close() }, 1)</script>');
  }
  
  function buildMessageClassificationCard(e) {
  
    var logoutAction = getLogout();
    
    var user = JSON.parse(cache.get('dataUser'));
    if (user == null) {
      return logout();
    }
    
    getAddonData(e);
    
    var addonData = JSON.parse(cache.get('getAddonData'));
 
    getClassifications(addonData.messageId, addonData.bbdd, addonData.idUser);
  
    var service = showNewConection()
    var authUrl = service.getAuthorizationUrl()
  
    var cardChangeAction = CardService.newAction()
          .setFunctionName('onChangeCompany')
  
    var changeCard = CardService.newImage()
    .setAltText("Regresar a la lista de empresas")
    .setImageUrl("https://www.dropbox.com/s/zmpwmcd333nfid0/Screenshot%202020-05-09%2011.47.42.png?raw=1")
    .setOnClickAction(cardChangeAction);
  
    var companyIdentifiedText = CardService.newTextParagraph().
    setText('Empresa Identificada: ');
  
    var companyText = CardService.newTextParagraph().
    setText('<font color="#001978">' + addonData.name + '</font>');
  
    var classifyMessages = CardService.newImage()
    .setAltText("Clasificar mensajes")
    .setImageUrl("https://www.dropbox.com/s/tt80ho1st9ei233/Screen%20Shot%202020-03-24%20at%202.18.20%20PM.png?raw=1");
  
    var messageDescription =  CardService.newTextParagraph().
    setText('Seleccione un mensaje y califíquelo en Lex-on. La relación establecida será visible en este panel.')
  
    var action = CardService.newAction()
    .setFunctionName('showNewConection');
  
    var button = CardService.newImage()
    .setAltText("Nueva conexión")
       .setImageUrl("https://www.dropbox.com/s/5mq9albce82msne/Screen%20Shot%202020-03-26%20at%206.44.32%20PM.png?raw=1")
       .setAuthorizationAction(CardService.newAuthorizationAction()
       .setAuthorizationUrl(authUrl));
       
    var messageId = e.messageMetadata.messageId;
    var thread = GmailApp.getMessageById(messageId).getThread();
    var messageNumber = thread.getMessageCount();
  
  
    var imgClassifications = CardService.newImage()
    .setAltText("Clasificaciones")
    .setImageUrl("https://www.dropbox.com/s/z1pntri2wwo57fu/Screen%20Shot%202020-03-26%20at%207.02.50%20PM.png?raw=1")
  
    var imgClassificationsWhitoutMessage = CardService.newImage()
    .setAltText("Clasificaciones")
    .setImageUrl("https://www.dropbox.com/s/8v4mif3u439jdbg/Screen%20Shot%202020-04-15%20at%2010.14.58%20AM.png?raw=1")
  
    var selectionCompany = CardService.newCardSection()
    .addWidget(changeCard)
    .addWidget(companyIdentifiedText)
    .addWidget(companyText)
    .addWidget(classifyMessages)
    .addWidget(messageNumber > 0 ? button : messageDescription);
  
   if(classificationsResponse.data == null) {
     selectionCompany.addWidget(imgClassifications);
   } else {
     selectionCompany.addWidget(imgClassificationsWhitoutMessage);
     for (var i = 0; i < classificationsResponse.data.length; i++) {
      var classification = classificationsResponse.data[i];
  
      getClassificationData(classification.entityIdType, classification.idRelated, 
        addonData.bbdd, addonData.idUser) 
  
      getNameEntityType(classification.entityType);
  
      selectionCompany.addWidget(CardService.newTextParagraph().
      setText('<font color="#001978">' + nameEntityType + ':</font>'));
  
      selectionCompany.addWidget(CardService.newTextParagraph().
      setText(classificationsDataResponse.data.description));
  
      selectionCompany.addWidget(CardService.newTextParagraph().
      setText(classificationsDataResponse.data.intervening != null ? 
        classificationsDataResponse.data.intervening : ''));
      
      var actionRemoveClassification = CardService.newAction()
      .setFunctionName('onRemoveClassification')
      .setParameters({idMail: classification.idMail, 
        idType: classification.entityIdType.toString(), 
        idRelated: classification.idRelated.toString() });
  
      selectionCompany.addWidget(CardService.newImage()
      .setAltText("Eliminar")
      .setImageUrl("https://www.dropbox.com/s/bqp5lxy00ag7bbm/Screenshot%202020-04-15%2013.40.09.png?raw=1")
      .setOnClickAction(actionRemoveClassification));
  
      selectionCompany.addWidget(CardService.newTextParagraph()
      .setText('<font color="#001978">-------------------------------------------------------------</font>'));
  
     }
    
   }
   
    var card = CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader()
      .setTitle('Clasificar Mensajes'))
      .addCardAction(logoutAction)
      .addSection(selectionCompany);
      
      return card.build();
  }
  
  function onRemoveClassification(e) {
    var addonData = JSON.parse(cache.get('getAddonData'));
    deleteClassification(e.parameters.idMail, e.parameters.idType, 
      addonData.bbdd, addonData, e.parameters.idRelated, addonData.idCompany);
    var MessageClassificationCard = buildMessageClassificationCard(e);
     return CardService.newActionResponseBuilder()
     .setNavigation(CardService.newNavigation().updateCard(MessageClassificationCard))
     .build();
  }
  
  function onChangeCompany(e) {
    cache.remove('getAddonData');
    cache.remove('companyData');
    cache.remove('selectCompany');
    var HomeCard = buildAddOn(e);
    return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().updateCard(HomeCard))
    .build();
  }