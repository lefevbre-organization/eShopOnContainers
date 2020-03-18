var apiEndpoint = "https://lexbox-test-apigwlex.lefebvre.es/api/v1/lex/Lexon/";

function buildHomeCard() {

  var url = this.apiEndpoint + "companies";
    var response = UrlFetchApp.fetch(url, {
      method: "get",
      // headers: headers,
      muteHttpExceptions: true
    });
    var raw = response.getContentText();
    var parsedResponse = JSON.parse(raw);

  
    var checkboxGroup = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.RADIO_BUTTON)
    .setTitle("Selecciona una empresa:")
    .setFieldName("checkbox_field")
    .setOnChangeAction(CardService.newAction()
        .setFunctionName("handleCheckboxChange"));

  for (var i = 0; i < parsedResponse.data.length; i++) {
    var company = parsedResponse.data[i]
    checkboxGroup.addItem(company.name, company.bbdd, false)
  }

    var action = CardService.newAction()
        .setFunctionName('onChangeCompany');
    var button = CardService.newTextButton()
        .setText('Entrar')
        .setOnClickAction(action)
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED);
    var buttonSet = CardService.newButtonSet()
        .addButton(button);

     var sectionFormCompany = CardService.newCardSection()
  
       .addWidget(checkboxGroup)
   
       .addWidget(buttonSet);

    var card = CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader()
      .setTitle('Lefebvre Gmail'))
      .addSection(sectionFormCompany);

    return card.build();
  }

  function onChangeCompany(e) {
    console.log(e);
    
  }