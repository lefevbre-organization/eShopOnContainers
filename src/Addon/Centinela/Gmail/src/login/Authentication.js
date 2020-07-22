var scopes = [
    "https://mail.google.com/",
      "https://www.googleapis.com/auth/gmail.addons.current.action.compose",
      "https://www.googleapis.com/auth/gmail.addons.execute",
      "https://www.googleapis.com/auth/gmail.addons.current.message.metadata",
      "https://www.googleapis.com/auth/script.external_request",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/drive"
  ]
  var keyClient = "AddonCentinelaClient";
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
    return OAuth2.createService('auth-centinela')
      .setAuthorizationBaseUrl(urlFrontend + 'oauth_centinela')
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
  
   
    var loginButton = CardService.newImage()
      .setAltText("Login")
       .setImageUrl("https://www.dropbox.com/s/otg9e2qyo99vs9h/Screenshot%202020-04-20%2010.12.01.png?raw=1")
       .setAuthorizationAction(CardService.newAuthorizationAction()
              .setAuthorizationUrl(authUrl));
              
  
      var card = CardService.newCardBuilder()
          .addSection(CardService.newCardSection()
          .addWidget(loginButton))
          .build()
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
    return buildHomeCard();
  }
  
  function logout(e) { 
    var service = getService();
    var login = create3PAuthorizationUi() 
    service.reset();
    return login
  }
  