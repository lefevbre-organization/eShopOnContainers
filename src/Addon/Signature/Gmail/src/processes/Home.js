var companyObj = {};
var key = "AddonSignatureSecret"

function getLogout() {
  var logoutAction = CardService.newCardAction()
  .setText("logout").setOnClickAction(CardService.newAction()
  .setFunctionName("logout"));
  return logoutAction
}


function buildHomeCard(e) { 
  
  var logoutAction = getLogout();

  var text = CardService.newTextParagraph().
  setText('<font color="#212529">Signature</font>');

  var sectionHome = CardService.newCardSection()
  .addWidget(text)

  
  var homeCard = CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader()
      .setImageUrl("https://assets.lefebvre.es/media/logos/web/comunes/favicon.ico")
      .setTitle('')
      .setSubtitle(''))
      .addCardAction(logoutAction)
      .addSection(sectionHome);
  
    return homeCard.build();
   
 }



