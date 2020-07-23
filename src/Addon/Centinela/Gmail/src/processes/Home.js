var SPACES = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
var MESSAGESPACES = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
var companyObj = {};
var key = "AddonLexonSecret"

function getLogout() {
  var logoutAction = CardService.newCardAction()
  .setText("logout").setOnClickAction(CardService.newAction()
  .setFunctionName("logout"));
  return logoutAction
}


function showNewConection() {
  var token = cache.get('token');
  return ArchiveMessagesService.createService('centinela')
    .setAuthorizationBaseUrl(urlFrontend + 'centinela')
    .setAddonData(token)
    .setCallbackFunction('newConectionCallback')
    .setCache(CacheService.getUserCache())
    .setPropertyStore(PropertiesService.getUserProperties())
    .setLock(LockService.getUserLock())
    .setExpirationMinutes(120)
    .setParam('access_type', 'offline')
    .setParam('prompt', 'consent')
    .setParam('approval_prompt', 'force');
}

function newConectionCallback(callbackRequest) {
  Logger.log("Run newConectionCallback!");
  
  return HtmlService.createHtmlOutput('Success! <script>setTimeout(function() { top.window.close() }, 1)</script>');
}


function buildHomeCard(e) { 
  
  var logoutAction = getLogout();

  var user = JSON.parse(cache.get('dataUser'));
   
  if(user == null) {
    return logout();
  }

  getAddonData(e);

  var service = showNewConection();
  
  var authUrl = service.getAuthorizationUrl();

  var archiveMessages = CardService.newImage()
  .setAltText("Clasificar mensajes")
  .setImageUrl("https://www.dropbox.com/s/08x7no9jzlg6uso/archive_gmail.png?raw=1");
  
  var button = CardService.newImage()
  .setAltText("Nueva clasificación")
  .setImageUrl("https://www.dropbox.com/s/m1pgsjeok4f09x8/archive_gmail_button.png?raw=1")
  .setOpenLink(CardService.newOpenLink()
  .setUrl(authUrl)
  .setOpenAs(CardService.OpenAs.FULL_SIZE)
  .setOnClose(CardService.OnClose.RELOAD_ADD_ON));
  
  var sectionArchiveMessage = CardService.newCardSection()
  .addWidget(archiveMessages)
  .addWidget(button)

  
  var homeCard = CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader()
      .setImageUrl("https://www.dropbox.com/s/yfv0fknt2zq8koj/icon-cn.png?raw=1")
      .setTitle(user.login)
      .setSubtitle(user.name))
      .addCardAction(logoutAction)
      .addSection(sectionArchiveMessage);
  
    return homeCard.build();
   
 }



