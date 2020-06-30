function buildDocumentAttachedCard(e) {
  
    var logoutAction = getLogout('gmailCompose');
    
    var user = JSON.parse(cache.get('dataUser'));
    var companyData = JSON.parse(cache.get('companyDataCompose'));
    if (user == null) {
      return logoutCompose(e);
    }
    
    var cardChangeAction = CardService.newAction()
          .setFunctionName('onChangeCompanyCompose')
  
    var companyIdentifiedText = CardService.newKeyValue()
    .setContent('Empresa Identificada:' + 
               '<br> <font color="#001978">' + companyData.name + '</font>')
    .setButton(CardService.newImageButton()
               .setAltText("Regresar a la lista de empresas")
    .setIconUrl("https://www.dropbox.com/s/pzz6tu6pmitg0xg/Screenshot%202020-06-26%2009.03.03.png?raw=1")
    .setOnClickAction(cardChangeAction));
  
    var classifyMessages = CardService.newImage()
    .setAltText("Clasificar mensajes")
    .setImageUrl("https://www.dropbox.com/s/x3edh57oot1ak9v/Screenshot%202020-06-25%2009.41.52.png?raw=1");
  
    var messageDescription =  CardService.newTextParagraph().
    setText('Busca en los expedientes y contactos de LEX-ON y adjunta a tus correos los archivos que necesites.')
    
    
     var fileSelectLexon = CardService.newKeyValue()
    .setContent('<font color="#001978">Selecciona los archivos en LEX-ON</font>')
    .setIconUrl("https://www.dropbox.com/s/vpqslp31gyxbmyh/Screenshot%202020-06-26%2008.54.47.png?raw=1")
    .setOnClickAction(cardChangeAction);
 
  
    var selectionCompany = CardService.newCardSection()
    .addWidget(companyIdentifiedText)
    .addWidget(classifyMessages)
    .addWidget(messageDescription)
    .addWidget(fileSelectLexon);


    var card = CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader()
      .setImageUrl("http://www.derechopractico.es/wp-content/uploads/2019/03/Logo-Lefebvre.jpg")
      .setTitle(user.login)
      .setSubtitle(user.name))
      .addSection(selectionCompany)
      .addCardAction(logoutAction);
      
      return card.build();
}
  
 
function onChangeCompanyCompose(e) {
  cache.remove('companyDataCompose');
  cache.remove('selectCompanyCompose');
  var composeCard = onGmailCompose();
  return CardService.newActionResponseBuilder()
  .setNavigation(CardService.newNavigation().updateCard(composeCard))
  .build();
}