var apiEndpoint = "https://lexbox-test-apigwlex.lefebvre.es/api/v1/lex/Lexon/";
var parsedResponse = [];

function getCompanyList(){
  var url = this.apiEndpoint + "companies";
    var response = UrlFetchApp.fetch(url, {
      method: "get",
      // headers: headers,
      muteHttpExceptions: true
    });
    var raw = response.getContentText();
    return parsedResponse = JSON.parse(raw);
}

function buildHomeCard(selectCompany) {
    getCompanyList();
    var checkboxGroup = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.RADIO_BUTTON)
    .setTitle("Selecciona una empresa:")
    .setFieldName("selectCompany")
    .setOnChangeAction(CardService.newAction()
        .setFunctionName("handleCheckboxChange"));

  for (var i = 0; i < parsedResponse.data.length; i++) {
    var company = parsedResponse.data[i]
    checkboxGroup.addItem(company.name, company.bbdd, false)
  }

    var action = CardService.newAction()
        .setFunctionName('onSveCompany')
        .setParameters({text: selectCompany ? selectCompany.name : ''});
    var button = CardService.newImage()
    .setAltText("Entrar")
       .setImageUrl("https://i.ibb.co/c2LcYk8/Screen-Shot-2020-03-20-at-7-17-27-AM.png")
        .setOnClickAction(action);

    // var buttonSet = CardService.newButtonSet()
    //     .addButton(button);

     var logoutAction = CardService.newCardAction()
       .setText("logout").setOnClickAction(CardService.newAction()
       .setFunctionName("logout"))

     var sectionFormCompany = CardService.newCardSection()
       .addWidget(checkboxGroup)
       .addWidget(button);

    var cardHome = CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader()
      .setTitle('Bienvenido'))
      .addCardAction(logoutAction)
      .addSection(sectionFormCompany);

    return cardHome.build();
  }

  function handleCheckboxChange(e){
    var selectCompany = e.formInput.selectCompany
    return getSelectCompany(selectCompany);
  }
  

  function getSelectCompany(selectCompany) {
    getCompanyList();
    var companyObj = {};
    for (var i = 0; i < parsedResponse.data.length; i++) {
        if(selectCompany == parsedResponse.data[i].bbdd){
          companyObj = parsedResponse.data[i];
        }
    }
    return onSveCompany(companyObj)
  }

  function onSveCompany(companyObj) {
    var companyIdentifiedText = CardService.newTextParagraph().
    setText('Empresa identificada: ')

    var companyText = CardService.newTextParagraph().
    setText(companyObj.name)

    var selectionCompany = CardService.newCardSection()
    .addWidget(companyIdentifiedText)

    .addWidget(companyText);

    var card = CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader()
      .setTitle('Empresa ' + companyObj.name))
      .addSection(selectionCompany)
      .build();
  
    return [card];
  }