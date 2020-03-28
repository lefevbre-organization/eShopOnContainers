var scopes = [
  'https://mail.google.com/'
]


function showNewConection(e) {
  return OAuth2.createService('Demo Auth')
    .setAuthorizationBaseUrl('http://localhost:3000/login')
    .setTokenUrl('https://lexbox-test-apigwlex.lefebvre.es/api/v1/mysql/LexonMySql/token')
    .setClientId('835159453859-mrrokdm9qdihjlv6f117k999qe8kvito.apps.googleusercontent.com')
    .setClientSecret('c8UNcaPhx5utB60d8qmJ42Cx')
    .setScope(scopes.join(' '))
    .setCallbackFunction('authCallback')
    .setCache(CacheService.getUserCache())
    .setPropertyStore(PropertiesService.getUserProperties())
}

function buildMessageClassificationCard(e, companyObj) {

  var service = showNewConection()
  var authUrl = service.getAuthorizationUrl()

  var logoutAction = getLogout();

  var setting = CardService.newImage()
  .setAltText("Clasificar mensajes")
  .setImageUrl("https://i.ibb.co/X3Yc9ch/Screen-Shot-2020-03-24-at-3-26-16-PM.png");

  var selectMessageText = CardService.newTextParagraph().
  setText('<font color="#7f8cbb">'
   + SPACES + 'MENSAJES SELECCIONADOS: </font>');

  var companyIdentifiedText = CardService.newTextParagraph().
  setText('Empresa Identificada: ');

  var companyText = CardService.newTextParagraph().
  setText('<font color="#001978">' + companyObj.name + '</font>');

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

  var messageId = e.messageMetadata.messageId;
  var thread = GmailApp.getMessageById(messageId).getThread();
  var messageNumber = thread.getMessageCount();

  var imgClassifications = CardService.newImage()
  .setAltText("Clasificaciones")
  .setImageUrl("https://i.ibb.co/nP7CF8s/Screen-Shot-2020-03-26-at-7-02-50-PM.png")

  // var label = GmailApp.getUserLabelByName("MyLabel");
  // var threads = label.getThreads();  
  // messageNumber = threads.length;

  var action = CardService.newAction()
      .setFunctionName('buildViewMessageCard');

  var selectionCompany = CardService.newCardSection()
  .addWidget(setting)
  .addWidget(selectMessageText)
   .addWidget(
    CardService.newKeyValue()
      .setButton(CardService.newTextButton()
                 .setText("Vista")
                 .setOnClickAction(action))
      .setMultiline(true)
      .setContent(MESSAGESPACES + messageNumber)

  )
  .addWidget(companyIdentifiedText)
  .addWidget(companyText)
  .addWidget(classifyMessages)
  .addWidget(messageNumber > 0 ? button : messageDescription);

 if(messageNumber > 0) {
  selectionCompany.addWidget(imgClassifications);
 }
 
  var card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
    .setTitle('Clasificar Mensajes'))
    .addCardAction(logoutAction)
    .addSection(selectionCompany);

  return card.build();
}


function buildViewMessageCard(e) {
  
  var logoutAction = getLogout();

  // var label = GmailApp.getUserLabelByName("MyLabel");
  // var threads = label.getThreads();
  // for (var i = 0; i < threads.length; i++) {

  //     selectionMessage.addWidget(CardService.newTextParagraph()
  //      .setText('----------------------------------------------------------'));

  //     selectionMessage.addWidget(CardService.newTextParagraph()
  //     .setText('<font color="#001978">Folder: </font>' + 
  //     label.getName()));

  //     selectionMessage.addWidget(CardService.newTextParagraph()
  //     .setText('<font color="#001978">Subject: </font>' + 
  //     threads[i].getFirstMessageSubject()));

  //   }

   var selectionMessage = CardService.newCardSection()

  var messageId = e.messageMetadata.messageId;
  var thread = GmailApp.getMessageById(messageId).getThread();
  var folderName = '';

  if(thread.isInInbox() == true) {
    folderName = 'Bandeja de entrada';
  } else if(thread.isInSpam() == true){
    folderName = 'Correo no deseado';
  } else if(thread.isInTrash() == true) {
    folderName = 'Basura';
  } else {
    folderName = '';
  }

  selectionMessage.addWidget(CardService.newTextParagraph()
  .setText('-------------------------------------------------------------'));

   selectionMessage.addWidget(CardService.newTextParagraph()
   .setText('<font color="#001978">Folder: </font>' + folderName));

  selectionMessage.addWidget(CardService.newTextParagraph()
      .setText('<font color="#001978">Subject: </font>' + 
      thread.getFirstMessageSubject()));
 
  var card = CardService.newCardBuilder()
  .setHeader(CardService.newCardHeader()
  .setTitle('Lista de Mensajes: ' + thread.getMessageCount()))
  .addCardAction(logoutAction)
  .addSection(selectionMessage);

  return card.build();
}