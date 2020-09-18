
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

export const addCalendarEvent = (idCalendar, event) => {   
    return new Promise(async (resolve, reject) => {

        const event = {
            subject: "Let's go for lunch",
            body: {
                contentType: "HTML",
                content: "Does mid month work for you?"
            },
            start: {
                dateTime: "2020-09-15T12:00:00",
                timeZone: "Pacific Standard Time"
            },
            end: {
                dateTime: "2020-09-15T14:00:00",
                timeZone: "Pacific Standard Time"
            },
            location: {
                displayName: "Harry's Bar"
            },
            attendees: [
                {
                    emailAddress: {
                        address: "adelev@contoso.onmicrosoft.com",
                        name: "Adele Vance"
                    },
                    type: "required"
                }
            ]
        };


        const accessToken = await getAccessTokenSilent();
        const client = getAuthenticatedClient(accessToken);
        client
            .api(`me/calendars/${idCalendar}/events`)
            .post(event)
            .then((response) =>
                resolve(returnCreateEventParser(response)))
            .catch((err) => {
                reject(err);
            });
    });
};



//export const addCalendarEvent = (calendar, event) =>
//    new Promise((resolve, reject) => {
//        window.gapi.client.calendar.events
//            .insert({
//                calendarId: calendar ,
//                resource: event,
//                sendUpdates: 'all',
//            })

//            .then(response => {
//                resolve(response.result);
//            })
//            .catch(err => {
//                reject(err);
//            });

//    });

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

export const deleteCalendarEvent = (calendar, eventId) => {
    return new Promise(async (resolve, reject) => {
        const accessToken = await getAccessTokenSilent();
        const client = getAuthenticatedClient(accessToken);
        client
            .api(`me/events/${eventId}`)
            .delete()
            .then((response) =>
                resolve(response))
            .catch((err) => {
                reject(err);
            });
    });
}

//export const deleteCalendarEvent = (calendar, eventId) =>
//    new Promise((resolve, reject) => {
//        window.gapi.client.calendar.events
//            .delete({
//                calendarId: calendar,
//                eventId: eventId,
//                sendUpdates: 'all'
//            })

//            .then(response => {
//                resolve(response.result);
//            })
//            .catch(err => {
//                reject(err);
//            });

//    });

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

    let items;
    items = ({ items: listParse });

    return items;

    //return listParse;
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

function returnCreateEventParser(list) {
    let listParse = []; 
    listParse.push({
        attendees: list.attendees,
        created: list.createdDateTime,
        creator: { email: "", self: true },
        description: list.bodyPreview,
        end: { dateTime: list.end.dateTime, timeZone: list.end.timeZone },
        etag: "",
        htmlLink: "",
        iCalUID: list.iCalUId,
        id: list.id,
        kind: "calendar#event",
        organizer: { email: "", self: true },
        recurrence: [list.recurrence],
        reminders: { useDefault: true },
        sequence: 0,
        start: { dateTime: list.start.dateTime, timeZone: list.start.timeZone },
        status: "confirmed",
        summary: list.subject,
        updated: list.lastModifiedDateTime,
        __proto__: Object,
    })

    let listToReturn = listParse[0]
    return listToReturn;
}


      
//return event google

//attendees: [{ … }]
//created: "2020-09-15T14:45:17.000Z"
//creator: { email: "alberto.valverde.escribano@gmail.com", self: true }
//description: "esto es una prueba"
//end: { dateTime: "2020-09-02T09:30:00+02:00", timeZone: "Europe/Madrid" }
//etag: ""3200362235538000""
//htmlLink: "https://www.google.com/calendar/event?eid=YmdmMWp1MGhobmVqMnE1cjVvMjE4dmUycWtfMjAyMDA5MDJUMDcwMDAwWiBhbGJlcnRvLnZhbHZlcmRlLmVzY3JpYmFub0Bt"
//iCalUID: "bgf1ju0hhnej2q5r5o218ve2qk@google.com"
//id: "bgf1ju0hhnej2q5r5o218ve2qk"
//kind: "calendar#event"
//organizer: { email: "alberto.valverde.escribano@gmail.com", self: true }
//recurrence: ["RRULE:FREQ=DAILY;INTERVAL=1"]
//reminders: { useDefault: true }
//sequence: 0
//start: { dateTime: "2020-09-02T09:00:00+02:00", timeZone: "Europe/Madrid" }
//status: "confirmed"
//summary: "prueba"
//updated: "2020-09-15T14:45:17.769Z"
//__proto__: Object

//Return event Office365
//@odata.context: "https://graph.microsoft.com/v1.0/$metadata#users('a72538e2-c9fd-4207-913c-b1104aab6407')/calendars('AAMkADYwN2U5OWZlLWUwZDktNDQ3Yi05MTQ2LTMxYmUyMGExMjcwNgBGAAAAAAABGTrist65R5XlVfmY3KAqBwAcnBiKLwlKQrviB8XkwxacAAAAAAEGAAAcnBiKLwlKQrviB8XkwxacAAAAAB05AAA%3D')/events/$entity"
//@odata.etag: "W/"HJwYii8JSkK74gfF5MMWnAABiGRL5A == ""
//allowNewTimeProposals: true
//attendees: [{ … }]
//body: {
//    contentType: "html", content: "<html>
//    ↵<head>
//        ↵<meta http-equiv="Content-Type" co…↵Does mid month work for you?
//↵</body>
//↵</html >
//    ↵"}
//    bodyPreview: "Does mid month work for you?"
//    categories: []
//    changeKey: "HJwYii8JSkK74gfF5MMWnAABiGRL5A=="
//    createdDateTime: "2020-09-15T14:26:09.8128699Z"
//    end: { dateTime: "2020-09-15T14:00:00.0000000", timeZone: "Pacific Standard Time" }
//    hasAttachments: false
//    iCalUId: "040000008200E00074C5B7101A82E0080000000044ED04286C8BD60100000000000000001000000085E76C7DF914384D90EE38C722437D72"
//    id: "AAMkADYwN2U5OWZlLWUwZDktNDQ3Yi05MTQ2LTMxYmUyMGExMjcwNgBGAAAAAAABGTrist65R5XlVfmY3KAqBwAcnBiKLwlKQrviB8XkwxacAAAAAAENAAAcnBiKLwlKQrviB8XkwxacAAGI3iNEAAA="
//    importance: "normal"
//    isAllDay: false
//    isCancelled: false
//    isOnlineMeeting: false
//    isOrganizer: true
//    isReminderOn: true
//    lastModifiedDateTime: "2020-09-15T14:26:11.0401585Z"
//    location: { displayName: "Harry's Bar", locationType: "default", uniqueId: "Harry's Bar", uniqueIdType: "private" }
//    locations: [{ … }]
//    onlineMeeting: null
//    onlineMeetingProvider: "unknown"
//    onlineMeetingUrl: null
//    organizer: { emailAddress: { … } }
//    originalEndTimeZone: "Pacific Standard Time"
//    originalStartTimeZone: "Pacific Standard Time"
//    recurrence: null
//    reminderMinutesBeforeStart: 15
//    responseRequested: true
//    responseStatus: { response: "organizer", time: "0001-01-01T00:00:00Z" }
//    sensitivity: "normal"
//    seriesMasterId: null
//    showAs: "busy"
//    start: { dateTime: "2020-09-15T12:00:00.0000000", timeZone: "Pacific Standard Time" }
//    subject: "Let's go for lunch"
//    transactionId: null
//    type: "singleInstance"
//    webLink: "https://outlook.office365.com/owa/?itemid=AAMkADYwN2U5OWZlLWUwZDktNDQ3Yi05MTQ2LTMxYmUyMGExMjcwNgBGAAAAAAABGTrist65R5XlVfmY3KAqBwAcnBiKLwlKQrviB8XkwxacAAAAAAENAAAcnBiKLwlKQrviB8XkwxacAAGI3iNEAAA%3D&exvsurl=1&path=/calendar/item"
//    __proto__: Object

