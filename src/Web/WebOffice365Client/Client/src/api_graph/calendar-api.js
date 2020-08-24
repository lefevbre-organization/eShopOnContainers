
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
                resolve(listEventsParser(response.value)))
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

    //let items;
    //items = ({ items: listParse });

    //return items;

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

function listEventsParser(list) {   
    let listParse = [];

    //created: "2020-08-10T15:23:00.000Z"
    //creator: { email: "alberto.valverde.escribano@gmail.com", self: true }
    //end: { dateTime: "2020-08-10T10:30:00+02:00", timeZone: "Europe/Madrid" }   
    //extendedProperties: { private: { … } }   
    //id: "2r8cdgabbhkgivlj9o19umk4tc"   
    //organizer: { email: "alberto.valverde.escribano@gmail.com", self: true }
    //recurrence: ["RRULE:FREQ=DAILY;INTERVAL=1"]
    //reminders: { useDefault: true }
    //sequence: 1
    //start: { dateTime: "2020-08-10T10:00:00+02:00", timeZone: "Europe/Madrid" }
    //status: "confirmed"
    //summary: "daily"
    //updated: "2020-08-10T16:57:39.880Z"
    //let when = event.start.dateTime;
    //let start = event.start.dateTime;
    //let end = event.end.dateTime;

    if (list.length > 0) {
        for (let i = 0; i < list.length; i++) {
             listParse.push({
                   
                            id: list[i].id,
                            summary: list[i].subject,
                            Location: list[i].location.displayName,
                            Description: list[i].bodyPreview,
                            start: { dateTime: list[i].start.dateTime },
                            end: { dateTime: list[i].end.dateTime },
                            IsAllDay: !list[i].start.dateTime,
                            RecurrenceRule: null,
                            ImageName: "lefebvre",
                            Attendees: undefined,
                            EventType: undefined,
                          
             });
        }
    }
    
    let result;
    let items;
    items= ({ items: listParse });
    result = ({ result: items });

    return result
}


        //categories: []
        //changeKey: "HJwYii8JSkK74gfF5MMWnAABdUd83g=="
        //createdDateTime: "2020-08-19T10:03:20.4898169Z"
        //end: { dateTime: "2020-08-19T15:30:00.0000000", timeZone: "UTC" }
        //hasAttachments: false
        //iCalUId: "040000008200E00074C5B7101A82E008000000005B79EBF50F76D6010000000000000000100000008CA1C1D21B7FDA4D857F2CE94D899854"
        //id: "AAMkADYwN2U5OWZlLWUwZDktNDQ3Yi05MTQ2LTMxYmUyMGExMjcwNgBGAAAAAAABGTrist65R5XlVfmY3KAqBwAcnBiKLwlKQrviB8XkwxacAAAAAAENAAAcnBiKLwlKQrviB8XkwxacAAF1utUgAAA="
        //importance: "normal"
        //isAllDay: false
        //isCancelled: false
        //isOnlineMeeting: true
        //isOrganizer: false
        //isReminderOn: true
        //lastModifiedDateTime: "2020-08-19T14:18:56.2804738Z"
        //location: { displayName: "", locationType: "default", uniqueIdType: "unknown", address: { … }, coordinates: { … } }
        //locations: []
        //onlineMeeting: { joinUrl: "https://teams.microsoft.com/l/meetup-join/19%3amee…2%3a%22efe4a456-9505-4700-ae67-7d9dee684a52%22%7d" }
        //onlineMeetingProvider: "teamsForBusiness"
        //onlineMeetingUrl: null
        //organizer: { emailAddress: { … } }
        //originalEndTimeZone: "Romance Standard Time"
        //originalStartTimeZone: "Romance Standard Time"
        //recurrence: null
        //reminderMinutesBeforeStart: 15
        //responseRequested: true
        //responseStatus: { response: "accepted", time: "2020-08-19T10:03:41.7058983Z" }
        //sensitivity: "normal"
        //seriesMasterId: null
        //showAs: "busy"
        //start: { dateTime: "2020-08-19T15:00:00.0000000", timeZone: "UTC" }
        //subject: "Reunión Api Jitsi"
        //type: "singleInstance"
        


//{
//        "allowedRoles": ["string"],
//        "emailAddress": { "@odata.type": "microsoft.graph.emailAddress" },
//        "id": "String (identifier)",
//        "isInsideOrganization": "boolean",
//        "isRemovable": "boolean",
//        "role": "string"
//}


