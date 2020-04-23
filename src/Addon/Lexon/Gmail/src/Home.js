var scopes = [
  'https://mail.google.com/'
]

var SPACES = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
var MESSAGESPACES = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
var companyObj = {};
var cache = CacheService.getScriptCache();

function getLogout() {
  var logoutAction = CardService.newCardAction()
       .setText("logout").setOnClickAction(CardService.newAction()
       .setFunctionName("logout"))

  return logoutAction
}

function buildHomeCard(selectCompany) { 
    getCompanyList();
    var checkboxGroup = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.RADIO_BUTTON)
    .setTitle("Selecciona una Empresa:")
    .setFieldName("selectCompany")
    .setOnChangeAction(CardService.newAction()
        .setFunctionName("handleCheckboxChange"));

       for (var i = 0; i < companyResponse.data.length; i++) {
        var company = companyResponse.data[i];
        company.selected = false
        if(selectCompany && selectCompany.bbdd == company.bbdd){
          company.selected = true;
        }
        checkboxGroup.addItem(company.name, company.bbdd, company.selected)
       } 
 
    var action = CardService.newAction()
        .setFunctionName('onSveCompany')
    .setParameters({name: selectCompany ? selectCompany.name : '', 
                    bbdd: selectCompany ? selectCompany.bbdd : ''});
    var button = CardService.newImage()
    .setAltText("Entrar")
       .setImageUrl("https://i.ibb.co/c2LcYk8/Screen-Shot-2020-03-20-at-7-17-27-AM.png")
        .setOnClickAction(action);

    // var buttonSet = CardService.newButtonSet()
    //     .addButton(button);

    var logoutAction = getLogout();
 
    var sectionFormCompany = CardService.newCardSection()
     .addWidget(checkboxGroup)
     .addWidget(button);
    var user = JSON.parse(cache.get('dataUser'));
    if (user == null) {
      return logout();
    }
    var homeCard = CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader()
      .setTitle('Lista de Empresas'))
      .addCardAction(logoutAction)
      .addSection(sectionFormCompany);
  
   return homeCard.build();
   
  }

  function handleCheckboxChange(e){
    var selectCompany = e.formInput.selectCompany
    return getSelectCompany(e, selectCompany);
  }
  

  function getSelectCompany(e, selectCompany) {
    getCompanyList();
    for (var i = 0; i < companyResponse.data.length; i++) {
        if(selectCompany == companyResponse.data[i].bbdd){
          companyObj = companyResponse.data[i];
        }
    }

    var user = JSON.parse(cache.get('dataUser'));
    var account = Session.getActiveUser().getEmail()
    var messageId = e.messageMetadata.messageId;
    var thread = GmailApp.getMessageById(messageId).getThread();
    var subject = thread.getFirstMessageSubject();
    var messageDate = thread.getLastMessageDate();
    
    var getAddonData = {
      idCompany: companyObj.idCompany,
      bbdd: companyObj.bbdd,
      name: companyObj.name,
      account: account,
      provider: 'GO',
      messageId: messageId,
      subject: subject,
      folder: 'Inbox',
      sentDateTime: messageDate,
      idUser: user.data.idUser,
      userName: user.data.name
    }
  
    cache.put('getAddonData', JSON.stringify(getAddonData), 21600);

    var homeCard = buildHomeCard(companyObj);
    return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().updateCard(homeCard))
    .build()
 
  }

  function onSveCompany(e) {
    Logger.log(e.parameters.name, e.parameters.bbdd)
    var messageId = e.messageMetadata.messageId;
    cache.put('messageId', JSON.stringify(messageId), 21600);
    var MessageClassificationCard = buildMessageClassificationCard(e);
    return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(MessageClassificationCard))
    .build()
  }