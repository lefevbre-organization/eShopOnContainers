var scopes = [
    'https://www.googleapis.com/auth/script.external_request',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/gmail.addons.execute',
    'https://www.googleapis.com/auth/gmail.addons.current.message.readonly'
  ]
  
  
  function getService() {
    return OAuth2.createService('Demo Auth')
      .setAuthorizationBaseUrl('http://localhost:3000/login')
      .setTokenUrl('https://lexbox-test-apigwlex.lefebvre.es/api/v1/mysql/LexonMySql/token')
      .setClientId('835159453859-mrrokdm9qdihjlv6f117k999qe8kvito.apps.googleusercontent.com')
      .setClientSecret('c8UNcaPhx5utB60d8qmJ42Cx')
      .setScope(scopes.join(' '))
      .setCallbackFunction('authCallback')
      .setCache(CacheService.getUserCache())
      .setPropertyStore(PropertiesService.getUserProperties())
  }
  
  
  function create3PAuthorizationUi() {
      var service = getService()
      var authUrl = service.getAuthorizationUrl()
      var loginButton = CardService.newTextButton()
          .setText('Login')
          .setAuthorizationAction(CardService.newAuthorizationAction()
              .setAuthorizationUrl(authUrl))
  
      var promptText = 'Please login first'
  
      var card = CardService.newCardBuilder()
          .addSection(CardService.newCardSection()
              .addWidget(CardService.newTextParagraph()
                  .setText(promptText))
              .addWidget(loginButton)
              ).build()
      return [card]
  }
  
  
  function authCallback(callbackRequest) {
      Logger.log("Run authcallback!")
      const authorized = getService().handleCallback(callbackRequest)
  
      console.log(authorized)
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
  
    checkAuth()
    var section = CardService.newCardSection()
    var textWidget = CardService.newTextParagraph().setText('Bienvenido')
  
    section.addWidget(textWidget);
  
    var card = CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader()
      .setTitle('Lefebvre Gmail'))
      .addSection(section)
      .build();
  
    return [card];
  }

  function logout() {
    var service = getService();
    var login = create3PAuthorizationUi();
    service.reset();
    return login
  }


  