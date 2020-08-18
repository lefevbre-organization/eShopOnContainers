
import config from '../Config';
import { UserAgentApplication } from 'msal';

const graph = require('@microsoft/microsoft-graph-client');
let userAgentApplication = null;

export const getUserApplication = () => {
    if (userAgentApplication === null) {
        const redirectUri = window.location.origin;

        userAgentApplication = new UserAgentApplication({
            auth: {
                clientId: config.appId,
                redirectUri: redirectUri,
                postLogoutRedirectUri: 'https://lexbox-webgraph.lefebvre.es',
            },
            cache: {
                cacheLocation: 'localStorage',
                storeAuthStateInCookie: true,
            },
        });

        userAgentApplication.handleRedirectCallback((error, response) => { });
    }

    return userAgentApplication;
};

export const getAuthenticatedClient = (accessToken) => {
    // Initialize Graph client
    const client = graph.Client.init({
        // Use the provided access token to authenticate
        // requests
        authProvider: (done) => {
            done(null, accessToken.accessToken);
        },
    });
    return client;
};

export const getAccessTokenSilent = async () => {
    console.log(config.scopes);
    return await window.msal.acquireTokenSilent({ scopes: config.scopes });
};

//Calendarlist Api

export const listCalendarList = () => {
    return new Promise(async (resolve, reject) => {
        const accessToken = await getAccessTokenSilent();
        const client = getAuthenticatedClient(accessToken);
        client
            .api(`me/calendars`)
            .get()
            .then((response) =>
                resolve(listCalendarParser(response.value)))
            .catch((err) => {
                reject(err);
            });
    });
};

//export const getCalendarList = (calendar) => {
//    new Promise((resolve, reject) => {
//        window.gapi.client.calendar.calendarList
//            .get({
//                calendarId: calendar,
//            })

//            .then(response => {
//                resolve(response.result);
//            })
//            .catch(err => {
//                reject(err);
//            });

//    });
//};

export const updateCalendarList = (calendarId, calendar) =>

    new Promise((resolve, reject) => {
        window.gapi.client.calendar.calendarList
            .update({
                calendarId: calendarId,
                colorRgbFormat: 'true',
                resource: calendar
            })

            .then(response => {
                resolve(response.result);
            })
            .catch(err => {
                reject(err);
            });

    });


//Calendars Api

export const updateCalendar = (calendarId, calendar) => {
    return new Promise(async (resolve, reject) => {
        const accessToken = await getAccessTokenSilent();
        const client = getAuthenticatedClient(accessToken);
        client
            .api(`me/calendars/${calendarId}`)
            .update(addCalendarParser(calendar))
            .then((response) =>
                resolve(response))
            .catch((err) => {
                reject(err);
            });
    });
};

export const getCalendar = (calendarId) => {   
    return new Promise(async (resolve, reject) => {
        const accessToken = await getAccessTokenSilent();
        const client = getAuthenticatedClient(accessToken);
        client
            .api(`me/calendars/${calendarId}`)
            .get()
            .then((response) =>
                resolve(getCalendarParser(response)))
            .catch((err) => {
                reject(err);
            });
    });   
};

export const addCalendar = (calendar) => { 
    return new Promise(async (resolve, reject) => {
        const accessToken = await getAccessTokenSilent();
        const client = getAuthenticatedClient(accessToken);
        client
            .api(`me/calendars`)
            .post(addCalendarParser(calendar))
            .then((response) =>
                resolve(response))
            .catch((err) => {
                reject(err);
            });
    });
};

export const deleteCalendar = (idCalendar) => {   
    return new Promise(async (resolve, reject) => {
        const accessToken = await getAccessTokenSilent();
        const client = getAuthenticatedClient(accessToken);
        client
            .api(`me/calendars/${idCalendar}`)
            .delete()
            .then((response) =>
                resolve(response))
            .catch((err) => {
                reject(err);
            });
    });
};
   




// Events Api
//GET /me/calendars/{id}/events

export const getEventList = (idCalendar, selectedDate) => {
    //to delete
   // idCalendar = "AAMkADYwN2U5OWZlLWUwZDktNDQ3Yi05MTQ2LTMxYmUyMGExMjcwNgBGAAAAAAABGTrist65R5XlVfmY3KAqBwAcnBiKLwlKQrviB8XkwxacAAAAAAEGAAAcnBiKLwlKQrviB8XkwxacAAAAAB05AAA=";
    return new Promise(async (resolve, reject) => {
        const accessToken = await getAccessTokenSilent();
        const client = getAuthenticatedClient(accessToken);
        client
            .api(`me/calendars/${idCalendar}/events`)
            .get()
            .then((response) =>
                resolve(response))
            .catch((err) => {
                reject(err);
            });
    });
};



export const addCalendarEvent = (calendar, event) =>
    new Promise((resolve, reject) => {
        window.gapi.client.calendar.events
            .insert({
                calendarId: calendar ,
                resource: event,
                sendUpdates: 'all',
            })

            .then(response => {
                resolve(response.result);
            })
            .catch(err => {
                reject(err);
            });

    });

export const updateCalendarEvent = (calendar, eventId, event) =>
    new Promise((resolve, reject) => {
        window.gapi.client.calendar.events
            .update({
                calendarId: calendar,
                eventId: eventId,
                resource: event,
                sendUpdates: 'all'
            })

            .then(response => {
                resolve(response.result);
            })
            .catch(err => {
                reject(err);
            });

    });

export const deleteCalendarEvent = (calendar, eventId) =>
    new Promise((resolve, reject) => {
        window.gapi.client.calendar.events
            .delete({
                calendarId: calendar,
                eventId: eventId,
                sendUpdates: 'all'
            })

            .then(response => {
                resolve(response.result);
            })
            .catch(err => {
                reject(err);
            });

    });

export const requestRecurringEvent = (calendar, eventId) =>
    new Promise((resolve, reject) => {
        window.gapi.client.calendar.events
            .get({
                calendarId: calendar,
                eventId: eventId
            })

            .then(response => {
                resolve(response.result);
            })
            .catch(err => {
                reject(err);
            });

    });


// Acl api

export const addAcl = (calendar, acl) =>
    new Promise((resolve, reject) => {
        window.gapi.client.calendar.acl
            .insert({
                calendarId: calendar,
                sendNotifications: true,
                resource: acl
            })
            .then(response => {
                resolve(response.result);
            })
            .catch(err => {
                reject(err);
            });

    });

////https://graph.microsoft.com/v1.0/me/calendars/AAMkADYwN2U5OWZlLWUwZDktNDQ3Yi05MTQ2LTMxYmUyMGExMjcwNgBGAAAAAAABGTrist65R5XlVfmY3KAqBwAcnBiKLwlKQrviB8XkwxacAAAAAAEGAAAcnBiKLwlKQrviB8XkwxacAAAAAB05AAA=/calendarpermissions
//export const listAcl = (calendar) =>

//    new Promise((resolve, reject) => {


//        window.gapi.client.calendar.acl
//            .list({
//                calendarId: calendar               
//            })
//            .then(response => {
//                resolve(response.result);
//            })
//            .catch(err => {
//                reject(err);
//            });

//    });

export const listAcl = (calendarId) => {
    return new Promise(async (resolve, reject) => {
        const accessToken = await getAccessTokenSilent();
        const client = getAuthenticatedClient(accessToken);
        client
            .api(`me/calendars/${calendarId}/calendarpermissions`)
            .get()
            .then((response) =>
                resolve(listACLParser(response.value)))
            .catch((err) => {
                reject(err);
            });
    });
};


export const deleteAcl = (calendar, ruleId) =>
    new Promise((resolve, reject) => {
        window.gapi.client.calendar.acl
            .delete({
                calendarId: calendar,
                ruleId: ruleId
            })
            .then(response => {
                resolve(response.result);
            })
            .catch(err => {
                reject(err);
            });

    });


function listCalendarParser(list) {
    let listParse = [];
    if (list.length > 0) {
        for (let i = 0; i < list.length; i++) {

            let roll;
            if (list[i].canShare) {
                roll = "owner";
            }

            let primary = false;
            if (list[i].canShare && !list[i].isRemovable) {
                primary = true
            }
            else {
                primary = undefined
            }

            let color = "#0693e3";
            if (list[i].color != "auto") {
                color = list[i].color
            }


            listParse.push({
                accessRole: roll,
                backgroundColor: color,
                //colorId: "16",          
                colorId: list[i].color,
                defaultReminders: [],
                id: list[i].id,
                primary: primary,
                selected: primary,
                summary: list[i].name,
                timeZone: "Europe/Madrid",
            });
        }
    }
    return listParse;
}

function getCalendarParser(list) {
    let listParse = {
                summary: list.name                             
            };        
    return listParse;
}

function addCalendarParser(list) {
    let listParse  = {
        name: list.summary
    };
    return listParse;
}

function listACLParser(list) {
    let listParse = [];
    if (list.length > 0) {
        for (let i = 0; i < list.length; i++) {   
            if (list[i].isRemovable)
            {
                listParse.push({
                    id: "user:" + list[i].isRemovable,
                    role: "owner" + list[i].emailAddress.address,
                    scope: {
                        type: "user",
                        value: list[i].emailAddress.address,
                    }
                });
            }            
        }
    }
    return listParse;
}


//{
//        "allowedRoles": ["string"],
//        "emailAddress": { "@odata.type": "microsoft.graph.emailAddress" },
//        "id": "String (identifier)",
//        "isInsideOrganization": "boolean",
//        "isRemovable": "boolean",
//        "role": "string"
//}


