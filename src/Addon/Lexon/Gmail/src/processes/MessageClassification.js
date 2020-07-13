function showNewConection() {
  var token = cache.get('token');
  return ClassifyMessages.createService('lexon')
    .setAuthorizationBaseUrl(urlFrontend + 'lexon')
    .setAddonData(token)
    .setCallbackFunction('newConectionCallback')
    .setCache(CacheService.getUserCache())
    .setPropertyStore(PropertiesService.getUserProperties())
    .setLock(LockService.getUserLock())
    .setExpirationMinutes(120)
    .setParam('access_type', 'offline')
    .setParam('prompt', 'consent')
    .setParam('approval_prompt', 'force');
}

function newConectionCallback(callbackRequest) {
  Logger.log("Run newConectionCallback!");
  
  return HtmlService.createHtmlOutput('Success! <script>setTimeout(function() { top.window.close() }, 1)</script>');
}

function buildMessageClassificationCard(e) {

  var logoutAction = getLogout(null);
  
  var user = JSON.parse(cache.get('dataUser'));
  if (user == null) {
    return logout(e);
  }
  
  getAddonData(e);
  
  var addonData = JSON.parse(cache.get('getAddonData'));

  getClassifications(addonData.messageId, addonData.bbdd, addonData.idUser);

  var service = showNewConection();
  
  var authUrl = service.getAuthorizationUrl();
  
  var cardChangeAction = CardService.newAction()
        .setFunctionName('onChangeCompany')

  var companyIdentifiedText = CardService.newKeyValue()
  .setContent('Empresa Identificada:' + 
             '<br> <font color="#001978">' + addonData.name + '</font>')
  .setButton(CardService.newImageButton()
             .setAltText("Regresar a la lista de empresas")
  .setIconUrl("https://www.dropbox.com/s/pzz6tu6pmitg0xg/Screenshot%202020-06-26%2009.03.03.png?raw=1")
  .setOnClickAction(cardChangeAction));

  var classifyMessages = CardService.newImage()
  .setAltText("Clasificar mensajes")
  .setImageUrl("https://www.dropbox.com/s/tt80ho1st9ei233/Screen%20Shot%202020-03-24%20at%202.18.20%20PM.png?raw=1");

  var button = CardService.newImage()
  .setAltText("Nueva clasificación")
     .setImageUrl("https://www.dropbox.com/s/0xtlunun3n0niyl/Screenshot%202020-05-12%2014.12.12.png?raw=1")
     .setOpenLink(CardService.newOpenLink()
      .setUrl(authUrl)
      .setOpenAs(CardService.OpenAs.FULL_SIZE)
      .setOnClose(CardService.OnClose.RELOAD_ADD_ON));
     
  var imgClassifications = CardService.newImage()
  .setAltText("Clasificaciones")
  .setImageUrl("https://www.dropbox.com/s/z1pntri2wwo57fu/Screen%20Shot%202020-03-26%20at%207.02.50%20PM.png?raw=1")

  var imgClassificationsWhitoutMessage = CardService.newImage()
  .setAltText("Clasificaciones")
  .setImageUrl("https://www.dropbox.com/s/8v4mif3u439jdbg/Screen%20Shot%202020-04-15%20at%2010.14.58%20AM.png?raw=1")

  var selectionCompany = CardService.newCardSection()
  .addWidget(companyIdentifiedText)
  .addWidget(classifyMessages)
  .addWidget(button);

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
    .setImageUrl("https://www.dropbox.com/s/oux8safwl16u8oo/icon-lx.png?raw=1")
    .setTitle(addonData.email)
    .setSubtitle(addonData.userName))
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
  var homeCard = buildAddOn(e);
  return CardService.newActionResponseBuilder()
  .setNavigation(CardService.newNavigation().updateCard(homeCard))
  .build();
}