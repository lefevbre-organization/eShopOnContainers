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

    var logoutAction = getLogout();

    var setting = CardService.newImage()
    .setAltText("Clasificar mensajes")
    .setImageUrl("https://i.ibb.co/X3Yc9ch/Screen-Shot-2020-03-24-at-3-26-16-PM.png");

    var selectMessageText = CardService.newTextParagraph().
    setText('<font color="#7f8cbb">'
     + SPACES + 'MENSAJES SELECCIONADOS: </font>');

     var messageNumber = 0;
     
    //  var selectMessageText = CardService.newTextParagraph().
    //  setText(MESSAGESPACES + messageNumber);
    
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
        .setFunctionName('saveAction')
   
    var selectionCompany = CardService.newCardSection()
    .addWidget(setting)
    .addWidget(selectMessageText)
     .addWidget(
      CardService.newKeyValue()
        .setButton(CardService.newTextButton()
                   .setText("+ Vista")
                   .setOnClickAction(action))
        .setMultiline(true)
        .setContent(MESSAGESPACES + messageNumber)
  
    )
    .addWidget(companyIdentifiedText)
    .addWidget(companyText)
    .addWidget(classifyMessages)
    .addWidget(messageDescription);

    var card = CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader()
      .setTitle('Clasificar Mensajes'))
      .addCardAction(logoutAction)
      .addSection(selectionCompany)
      .build();
  
    return [card];
  }