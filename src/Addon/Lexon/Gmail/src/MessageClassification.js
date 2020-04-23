var scopes = [
  'https://mail.google.com/'
]

function showNewConection() {
  
  var addonData = cache.get('getAddonData');

  return ClassifyMessages.createService('lexon')
    .setAuthorizationBaseUrl('https://localhost:3001/lexon')
    .setTokenUrl('https://28c249aa.ngrok.io/token')
    .setBbdd(addonData)
    .setCallbackFunction('newConectionCallback')
    .setCache(CacheService.getUserCache())
    .setPropertyStore(PropertiesService.getUserProperties())
}

function newConectionCallback(callbackRequest) {
  Logger.log("Run newConectionCallback!")
  // const authorized = showNewConection().handleCallback(callbackRequest)
  
  return HtmlService.createHtmlOutput('Success! <script>setTimeout(function() { top.window.close() }, 1)</script>');
}

function buildMessageClassificationCard(e) {
  
  var addonData = JSON.parse(cache.get('getAddonData'));

  getClassifications(addonData.messageId, addonData.bbdd, addonData.idUser);

  var service = showNewConection()
  var authUrl = service.getAuthorizationUrl()

  var logoutAction = getLogout();
  
  var cardChangeAction = CardService.newAction()
        .setFunctionName('onChangeCompany')

  var changeCard = CardService.newImage()
  .setAltText("Regresar a la lista de empresas")
  .setImageUrl("https://i.ibb.co/VjKrPQY/Screen-Shot-2020-04-13-at-2-50-42-PM.png")
  .setOnClickAction(cardChangeAction);

  var companyIdentifiedText = CardService.newTextParagraph().
  setText('Empresa Identificada: ');

  var companyText = CardService.newTextParagraph().
  setText('<font color="#001978">' + addonData.name + '</font>');

  var classifyMessages = CardService.newImage()
  .setAltText("Clasificar mensajes")
  .setImageUrl("https://i.ibb.co/R0BgJsp/Screen-Shot-2020-03-24-at-2-18-20-PM.png");

  var messageDescription =  CardService.newTextParagraph().
  setText('Seleccione un mensaje y califíquelo en Lex-on. La relación establecida será visible en este panel.')

  var action = CardService.newAction()
  .setFunctionName('showNewConection');

  var button = CardService.newImage()
  .setAltText("Nueva conexión")
     .setImageUrl("https://i.ibb.co/KVpQ1kZ/Screen-Shot-2020-03-26-at-6-44-32-PM.png")
     .setAuthorizationAction(CardService.newAuthorizationAction()
     .setAuthorizationUrl(authUrl));
     
    var dataId = cache.get('messageId');
    var messageId = JSON.parse(dataId);
    var thread = GmailApp.getMessageById(messageId).getThread();
    var messageNumber = thread.getMessageCount();


  var imgClassifications = CardService.newImage()
  .setAltText("Clasificaciones")
  .setImageUrl("https://i.ibb.co/nP7CF8s/Screen-Shot-2020-03-26-at-7-02-50-PM.png")

  var imgClassificationsWhitoutMessage = CardService.newImage()
  .setAltText("Clasificaciones")
  .setImageUrl("https://www.dropbox.com/s/8v4mif3u439jdbg/Screen%20Shot%202020-04-15%20at%2010.14.58%20AM.png?raw=1")

  var selectionCompany = CardService.newCardSection()
  .addWidget(companyIdentifiedText)
  .addWidget(changeCard)
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
   .build()
}

function onChangeCompany(e) {

  cache.remove('getAddonData');

  return buildAddOn(e);
}