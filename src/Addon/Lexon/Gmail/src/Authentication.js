  var scopes = [
    'https://www.googleapis.com/auth/script.external_request',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/gmail.addons.execute',
    'https://www.googleapis.com/auth/gmail.addons.current.message.readonly',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://mail.google.com/'
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
      .setAuthorizationBaseUrl(urlFrontend + 'login')
      .setTokenUrl(urlAuth + 'token')
      .setClientId(token)
      .setClientSecret(clientSecret)
      .setScope(scopes.join(' '))
      .setCallbackFunction('authCallback')
      .setCache(CacheService.getUserCache())
      .setPropertyStore(PropertiesService.getUserProperties())
  }
  
  
  function create3PAuthorizationUi() {
      var service = getService()
      var authUrl = service.getAuthorizationUrl()
  
      var logo = CardService.newImage()
      .setAltText("Logo")
      .setImageUrl("https://www.dropbox.com/s/csqs86p9kjgy80w/Screenshot%202020-04-20%2009.44.01.png?raw=1");
  
      var icon = CardService.newImage()
      .setAltText("Icon")
      .setImageUrl("https://www.dropbox.com/s/sspa471xfkibxvs/Screenshot%202020-04-20%2010.03.08.png?raw=1");
  
      var loginButton = CardService.newImage()
      .setAltText("Login")
       .setImageUrl("https://www.dropbox.com/s/otg9e2qyo99vs9h/Screenshot%202020-04-20%2010.12.01.png?raw=1")
       .setAuthorizationAction(CardService.newAuthorizationAction()
              .setAuthorizationUrl(authUrl));
              
     var reserved = CardService.newImage()
      .setAltText("©2020 Lefebvre. Todos los derechos reservados.")
      .setImageUrl("https://www.dropbox.com/s/sksg0u2iezrywje/Screenshot%202020-04-20%2011.01.43.png?raw=1");
  
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
      Logger.log("Run authcallback!")
      const authorized = getService().handleCallback(callbackRequest)
  
      return HtmlService.createHtmlOutput('Success! <script>setTimeout(function() { top.window.close() }, 1)</script>')
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
  
  function logout() {
    cache.remove('getAddonData');
    cache.remove('dataUser');
    cache.remove('companyData');
    cache.remove('selectCompany');
    
    var service = getService();
    var login = create3PAuthorizationUi();
    service.reset();
    return login
  }