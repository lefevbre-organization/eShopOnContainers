var scopes = [
  "https://mail.google.com/",
    "https://www.googleapis.com/auth/gmail.addons.current.action.compose",
    "https://www.googleapis.com/auth/gmail.addons.execute",
    "https://www.googleapis.com/auth/gmail.addons.current.message.metadata",
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/drive"
]
var keyClient = "AddonLexonClient";
var token = null;
var cache = CacheService.getUserCache();

function getTokenClient() {
  var header = {
    alg: "HS256",
    typ: "JWT",
  }; 
      
  var signature = Utilities.base64Encode(JSON.stringify(header)) + "." 
    + Utilities.base64Encode(JSON.stringify(clientId));
  
    token = signature + "." + 
    Utilities.base64Encode(
      Utilities.computeHmacSha256Signature(signature, keyClient)
    );
}


function getService() {
  getTokenClient();
  return OAuth2.createService('auth-lexon')
    .setAuthorizationBaseUrl(urlFrontend + 'oauth_lexon')
    .setTokenUrl(urlAuth)
    .setClientId(token)
    .setClientSecret(clientSecret)
    .setScope(scopes.join(' '))
    .setCallbackFunction('authCallback')
    .setCache(CacheService.getUserCache())
    .setPropertyStore(PropertiesService.getUserProperties())
    .setLock(LockService.getUserLock())
    .setExpirationMinutes(3600)
    .setParam('access_type', 'offline')
    .setParam('prompt', 'consent'); 
}


function create3PAuthorizationUi() {
    var service = getService()
    var authUrl = service.getAuthorizationUrl()

    var logo = CardService.newImage()
    .setAltText("Logo")
    .setImageUrl("https://www.dropbox.com/s/csqs86p9kjgy80w/logo-lexon.png?raw=1");

    var icon = CardService.newImage()
    .setAltText("Lex-on")
    .setImageUrl("https://www.dropbox.com/s/sspa471xfkibxvs/lexon.png?raw=1");

    var loginButton = CardService.newImage()
    .setAltText("Login")
     .setImageUrl("https://www.dropbox.com/s/fm96fyc83ujsfhp/button.png?raw=1")
     .setAuthorizationAction(CardService.newAuthorizationAction()
            .setAuthorizationUrl(authUrl));
            
   var reserved = CardService.newImage()
    .setAltText("©2020 Lefebvre. Todos los derechos reservados.")
    .setImageUrl("https://www.dropbox.com/s/tuifhvnq8mfg5if/lefebvre.png?raw=1");

    var card = CardService.newCardBuilder()
        .addSection(CardService.newCardSection()
            .addWidget(logo)
            .addWidget(icon)
            .addWidget(loginButton)
            .addWidget(reserved)
            ).build()
    return [card]
}

function authCallback(callbackRequest) {
   var service = getService();
  var authorized = service.handleCallback(callbackRequest);
  if (authorized) {
    Logger.log("Success!");
    return HtmlService.createHtmlOutput('Success! <script>setTimeout(function() { top.window.close() }, 1)</script>');
  } else {
    Logger.log("Denied!");
    return HtmlService.createHtmlOutput('Denied.');
  }
}

function checkAuth() {
  var service = getService()
  if (service.hasAccess()) return
   CardService.newAuthorizationException()
    .setAuthorizationUrl(service.getAuthorizationUrl())
    .setResourceDisplayName("Display name to show to the user")
    .setCustomUiCallback('create3PAuthorizationUi')
    .throwException()
   
}

function buildAddOn(e) {
  var accessToken = e.messageMetadata.accessToken;
  GmailApp.setCurrentMessageAccessToken(accessToken);
  checkAuth();
  var addonData = JSON.parse(cache.get('getAddonData'));
  if(addonData) {
    return buildMessageClassificationCard(e);
  }
  return buildHomeCard();
}

function logout(e) { 
  cache.remove('getAddonData');
  cache.remove('dataUser');
  cache.remove('companyData');
  cache.remove('selectCompany');

  var service = getService();
  var login = create3PAuthorizationUi() 
  service.reset();
  return login
}
