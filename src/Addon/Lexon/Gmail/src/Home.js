  var SPACES = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
  var MESSAGESPACES = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
  var companyObj = {};
  var cache = CacheService.getScriptCache();
  var key = "AddonLexonSecret"
  
  function getLogout() {
    var logoutAction = CardService.newCardAction()
         .setText("logout").setOnClickAction(CardService.newAction()
         .setFunctionName("logout"))
  
    return logoutAction
  }
  
  function buildHomeCard() { 
      getCompanyList();
      var checkboxGroup = CardService.newSelectionInput()
      .setType(CardService.SelectionInputType.RADIO_BUTTON)
      .setTitle("Selecciona una Empresa:")
      .setFieldName("selectCompany")
      .setOnChangeAction(CardService.newAction()
          .setFunctionName("handleCheckboxChange"));
  
         for (var i = 0; i < companyResponse.data.length; i++) {
          var company = companyResponse.data[i];
          company.selected = true
          checkboxGroup.addItem(company.name, company.bbdd, company.selected);
         } 
   
      var action = CardService.newAction()
          .setFunctionName('onSveCompany');
      var button = CardService.newImage()
      .setAltText("Entrar")
         .setImageUrl("https://www.dropbox.com/s/042ic4nutt5re85/Screen%20Shot%202020-03-20%20at%207.17.27%20AM.png?raw=1")
          .setOnClickAction(action);
  
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
    selectCompany = e.formInput.selectCompany
    cache.put('selectCompany', JSON.stringify(selectCompany), 21600);
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
  
    cache.put('companyData', JSON.stringify(companyObj), 21600);
    
   var MessageClassificationCard = buildMessageClassificationCard(e);
      return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().pushCard(MessageClassificationCard))
      .build();
  
  }
  
  function getFirstTimeCompany(e) {
      getCompanyList();
      var account = Session.getEffectiveUser().getEmail();
      companyResponse.data[0].account = account;
      cache.put('companyData', JSON.stringify(companyResponse.data[0]), 21600);
      var MessageClassificationCard = buildMessageClassificationCard(e);
      return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().pushCard(MessageClassificationCard))
      .build();
  }
  
  function onSveCompany(e) {
    //Logger.log(e.parameters.name, e.parameters.bbdd)
    var selectCompany = JSON.parse(cache.get('selectCompany'));
    if(selectCompany) {
     return getSelectCompany(e);
    } else {
      return getFirstTimeCompany(e);
    }
    
  }