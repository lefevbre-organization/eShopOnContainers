var scopes = [
  'https://mail.google.com/'
]

var apiEndpoint = "https://lexbox-test-apigwlex.lefebvre.es/api/v1/lex/Lexon/";
var parsedResponse = [];
var SPACES = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
var MESSAGESPACES = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

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

    var logoutAction = getLogout();

    var sectionFormCompany = CardService.newCardSection()
     .addWidget(checkboxGroup)
     .addWidget(button);

    var cardHome = CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader()
      .setTitle('Lista de Empresas'))
      .addCardAction(logoutAction)
      .addSection(sectionFormCompany);

    return cardHome.build();
  }

  function handleCheckboxChange(e){
    var selectCompany = e.formInput.selectCompany
    return getSelectCompany(e, selectCompany);
  }
  

  function getSelectCompany(e, selectCompany) {
    getCompanyList();
    var companyObj = {};
    for (var i = 0; i < parsedResponse.data.length; i++) {
        if(selectCompany == parsedResponse.data[i].bbdd){
          companyObj = parsedResponse.data[i];
        }
    }
    return onSveCompany(e, companyObj)
  }

  function onSveCompany(e, companyObj) {
    return buildMessageClassificationCard(e, companyObj);
  }