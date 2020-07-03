/**
 * Load Google People client library. List Contact requested info
 */
export const getContacts = () =>
    new Promise((resolve, reject) => {
        window.gapi.client.people.people.connections
            .list({
                resourceName: 'people/me',
                pageSize: 100,
                personFields: 'names,emailAddresses'
            })
            .then(response => {
                let arr = response.result.connections;
                let contacts = [];
                arr.map(function (item) {
                    if (typeof item.emailAddresses !== 'undefined') {
                        contacts.push(item.emailAddresses[0].value);
                    }
                });
                resolve(contacts);
            });
    });