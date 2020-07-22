/**
 * Load Google People client library. List Contact requested info
 */
export const getContacts = (token) =>
    new Promise((resolve, reject) => {
        window.gapi.client.people.people.connections
            .list({
                pageToken: token,
                resourceName: 'people/me',
                pageSize: 100,
                personFields: 'names,emailAddresses'
            })
            .then(response => {
                let arr = response.result.connections;
                let contacts = [];
                if(arr) {
                    arr.map(function (item) {
                        if (typeof item.emailAddresses !== 'undefined') {
                            for(let i = 0; i < item.emailAddresses.length; i++) {
                                contacts.push(item.emailAddresses[i].value);
                            }
                        }
                    });
                }
                resolve(contacts);
            })
            .catch( (err) => {
                console.log(err);
            });
    });

export const addContact = (contact) => {
    return new Promise((resolve, reject) => {
        window.gapi.client.people.people
            .createContact({
                "names": [
                    {
                        "givenName": contact.name
                    }
                ],
                "emailAddresses": [
                    {
                        "value": contact.email
                    }
                ],
                "phoneNumbers": [
                    {
                        "value": contact.mobilePhone
                    }
                ],
                "biographies": [
                    {
                        "value": "Lexon " + contact.tags[2],
                        "contentType": "TEXT_PLAIN"
                    }
                ]
            })
            .then(response => {
                resolve(response.result);
            })
            .catch(err => {
                reject(err);
            });
    });
}


export const searchContactByEmail = (email) => {
    return new Promise((resolve, reject) => {
        window.gapi.client.people.people
            .searchDirectoryPeople({
                query: email,
                readMask: 'emailAddresses',
                sources: 'DIRECTORY_SOURCE_TYPE_DOMAIN_CONTACT'
            })
            .then(response => {
                resolve(response.result);
            })
            .catch(err => {
                reject(err);
            });
    });
}


