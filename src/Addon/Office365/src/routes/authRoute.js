router.get('/', async function(req, res, next) {

  const authorization = req.get('Authorization');
    if (authorization == null) {
        let error = new Error('No Authorization header was found.');
        next(error);
    } else {
        const [schema, jwt] = authorization.split(' ');
        const formParams = {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
        requested_token_use: 'on_behalf_of',
        scope: ['Files.Read.All'].join(' ')
        };
        const stsDomain = 'https://localhost:3000/login';
        const tenant = 'common';
        const tokenURLSegment = 'oauth2/v2.0/token';
    
        try {
            const tokenResponse = await fetch(`${stsDomain}/${tenant}/${tokenURLSegment}`, {
                method: 'POST',
                body: form(formParams),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            const json = await tokenResponse.json();
    
            res.send(json);
        }
        catch(error) {
            res.status(500).send(error);
        }
    }
});