var SPACES = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
var MESSAGESPACES = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
var companyObj = {};
var key = "AddonLexonSecret"

function getLogout(data) {
  var logoutAction = CardService.newCardAction()
  .setText("logout");

  if(data != null) {
    logoutAction.setOnClickAction(CardService.newAction()
    .setFunctionName("logoutCompose"));
  } else {
    logoutAction.setOnClickAction(CardService.newAction()
    .setFunctionName("logout"));
  }
  
       
  return logoutAction
}

function buildHomeCard(data) { 
    getCompanyList();
  
    var companylistText = CardService.newTextParagraph().
    setText('<font color="#212529">Selecciona una empresa:</font>');
  
    var checkboxGroup = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.RADIO_BUTTON)
    .setFieldName("selectCompany")
    .setOnChangeAction(CardService.newAction()
        .setFunctionName("handleCheckboxChange"));

       for (var i = 0; i < companyResponse.data.length; i++) {
        var company = companyResponse.data[i];
        company.selected = true
        checkboxGroup.addItem(company.name, company.bbdd, company.selected);
       } 
 
    var action = CardService.newAction()
        .setFunctionName('onSveCompany')
        .setParameters(
          { data: data != null ? data : 'gmailMessage' }
        );
        
    var button = CardService.newImage()
    .setAltText("Entrar")
    .setOnClickAction(action);
    
    data != null ? button.setImageUrl("https://www.dropbox.com/s/mztcrsla1ihh8ou/Screenshot%202020-06-25%2007.47.20.png?raw=1") 
    : button.setImageUrl("https://www.dropbox.com/s/042ic4nutt5re85/Screen%20Shot%202020-03-20%20at%207.17.27%20AM.png?raw=1") 
    
    var logoutAction = getLogout(data);
 
    var sectionFormCompany = CardService.newCardSection()
     .addWidget(companylistText)
     .addWidget(checkboxGroup)
     .addWidget(button);
  
    var user = JSON.parse(cache.get('dataUser'));
    if (user == null && data) {
      return logoutCompose(data);
    } else if(user == null && !data) {
      return logout(data);
    }
  
    // var account = Session.getEffectiveUser().getEmail();
  
    var homeCard = CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader()
      .setImageUrl("http://www.derechopractico.es/wp-content/uploads/2019/03/Logo-Lefebvre.jpg")
      .setTitle(user.login)
      .setSubtitle(user.name))
      .addCardAction(logoutAction)
      .addSection(sectionFormCompany);
  
    return homeCard.build();
   
 }

function handleCheckboxChange(e){
  selectCompany = e.formInput.selectCompany
  cache.put('selectCompany', JSON.stringify(selectCompany), 85900);
  cache.put('selectCompanyCompose', JSON.stringify(selectCompany), 85900);
}


function getSelectCompany(e) {
  getCompanyList();
  var selectCompany = JSON.parse(cache.get('selectCompany'));
  for (var i = 0; i < companyResponse.data.length; i++) {
      if(selectCompany == companyResponse.data[i].bbdd){
        var account = Session.getEffectiveUser().getEmail();
        companyResponse.data[i].account = account;
        companyObj = companyResponse.data[i];
      }
  }

  cache.put('companyData', JSON.stringify(companyObj), 85900);
  if(e.parameters.data == 'gmailMessage') {
    var messageClassificationCard = buildMessageClassificationCard(e);
    return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(messageClassificationCard))
    .build();
  }else {
    var documentAttached = buildDocumentAttachedCard(e);
    return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(documentAttached))
    .build();
  }
 
}

function getFirstTimeCompany(e) {
    getCompanyList();
    var account = Session.getEffectiveUser().getEmail();
    companyResponse.data[0].account = account;
    cache.put('companyData', JSON.stringify(companyResponse.data[0]), 85900);
    cache.put('companyDataCompose', JSON.stringify(companyResponse.data[0]), 85900);
    if(e.parameters.data == 'gmailMessage') {
      var messageClassificationCard = buildMessageClassificationCard(e);
      return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().pushCard(messageClassificationCard))
      .build();
    } else {
      var documentAttached = buildDocumentAttachedCard(e);
      return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().pushCard(documentAttached))
      .build();
    }
   
}

function onSveCompany(e) {
  var selectCompany = JSON.parse(cache.get('selectCompany'));
  if(selectCompany) {
   return getSelectCompany(e);
  } else {
    return getFirstTimeCompany(e);
  }
  
}