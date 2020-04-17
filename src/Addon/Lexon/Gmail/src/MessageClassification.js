var scopes = [
  'https://mail.google.com/'
]

function showNewConection() {
  
  var company = cache.get('company');

  return ClassifyMessages.createService('lexon')
    .setAuthorizationBaseUrl('https://localhost:3001/lexon')
    .setTokenUrl('https://d7baf484.ngrok.io/token')
    .setBbdd(company)
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
  
  var company = JSON.parse(cache.get('company'));

  getClassifications(company.messageId, company.bbdd, company.idUser);

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
  setText('<font color="#001978">' + company.name + '</font>');

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
  .setImageUrl("https://uc7a4217a193d1dc6439a86b9c8e.dl.dropboxusercontent.com/cd/0/inline/A1-jwog0MWWK-4GoNmadjXUm13cSVXkYGfGvpDY48fPSSTUWdbUXrJwtrtUlLmiAJ_-W6ZIlppJkh9-WrPYGtw7wljsZBFbVvIyfPs5uWf5KGn2n3bvwyHDlv1LojBonUdM/file#")

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
    getNameEntityType(classificationsResponse.data[i].entityType);
    selectionCompany.addWidget(CardService.newTextParagraph().
    setText('<font color="#001978">' + nameEntityType + ':</font>'));
    selectionCompany.addWidget(CardService.newTextParagraph().
    setText(classificationsResponse.data[i].name));
    selectionCompany.addWidget(CardService.newImage()
    .setAltText("Eliminar")
    .setImageUrl("https://uc5108c57dbbcb8eda02136e1859.dl.dropboxusercontent.com/cd/0/inline/A19pwNR1jhzRJ4bUFKvWQMJezGwKcsW5FYZSh59ebzeTA96UK9O-Q3yB3jIZLCEpo7GKlYgg1fnEB9VxMUDZbuN6Es533dRfs8owcVj46Tn7k_-ZxP_sFdxxtMnB7F06_T8/file#"));
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

function onChangeCompany(e) {

  cache.remove('company');

  return buildAddOn(e);
}