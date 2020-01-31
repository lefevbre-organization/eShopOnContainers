module.exports = {
    appId: '0803434b-369f-4e1f-973b-85aa480dcf16',
    // redirectUri: 'https://now-webgraph.lefebvre.es',
    redirectUri: window.URL_LOGIN_REDIRECT_URL,
    scopes: [
        'user.read',
        'calendars.read',
        'mail.read',
        'mail.readwrite',
        'mail.send'
    ]
};


