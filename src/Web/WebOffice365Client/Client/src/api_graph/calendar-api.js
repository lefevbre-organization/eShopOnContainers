//Calendarlist Api
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
                postLogoutRedirectUri: 'https://lexbox-test-webgraph.lefebvre.es',
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


//export const listCalendarList = () =>
//    new Promise((resolve, reject) => {
//        window.gapi.client.calendar.calendarList
//            .list({

//            })

//            .then(response => {
//                resolve(response.result);
//            })
//            .catch(err => {
//                reject(err);
//            });

//    });

export const listCalendarList = () => {
    return new Promise(async (resolve, reject) => {
        const accessToken = await getAccessTokenSilent();
        const client = getAuthenticatedClient(accessToken);
        client
            .api(`me/calendars`)
            .get()
            .then((response) =>
                resolve(response))
            .catch((err) => {
                reject(err);
            });
    });
};

export const getCalendarList = (calendar) =>
    new Promise((resolve, reject) => {
        window.gapi.client.calendar.calendarList
            .get({
                calendarId: calendar,
            })

            .then(response => {
                resolve(response.result);
            })
            .catch(err => {
                reject(err);
            });

    });

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

export const updateCalendar = (calendarId, calendar) =>
    new Promise((resolve, reject) => {
        window.gapi.client.calendar.calendars
            .update({
                calendarId: calendarId,
                resource: calendar
            })

            .then(response => {
                resolve(response.result);
            })
            .catch(err => {
                reject(err);
            });

    });

export const getCalendar = (calendar) =>
    new Promise((resolve, reject) => {
        window.gapi.client.calendar.calendars
            .get({
                calendarId: calendar,
            })

            .then(response => {
                resolve(response.result);
            })
            .catch(err => {
                reject(err);
            });

    });

export const addCalendar = (calendar) =>
    new Promise((resolve, reject) => {
        window.gapi.client.calendar.calendars
            .insert({               
                resource: calendar
            })

            .then(response => {
                resolve(response.result);
            })
            .catch(err => {
                reject(err);
            });

    });

export const deleteCalendar = (calendar) =>
    new Promise((resolve, reject) => {
        window.gapi.client.calendar.calendars
            .delete({
                calendarId: calendar,
            })

            .then(response => {
                resolve(response.result);
            })
            .catch(err => {
                reject(err);
            });

    });




// Events Api

export const getEventList = (idCalendar, selectedDate) =>
    new Promise((resolve, reject) => {
        window.gapi.client.calendar.events
            .list({
                calendarId: idCalendar,
                // timeMin: (new Date()).toISOString()
                // timeMin: (new Date(selectedDate.getFullYear(), selectedDate.getMonth(), -1)).toISOString(),
                // timeMax: (new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 2)).toISOString(),
                //showDeleted: false,
                //singleEvents: true,
                //maxResults: 10,
                //orderBy: 'startTime',
            })
            .then(response => {
                resolve(response)
            })
            .catch(error => {
                reject(error);
            });
    });

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

export const listAcl = (calendar) =>
    new Promise((resolve, reject) => {
        window.gapi.client.calendar.acl
            .list({
                calendarId: calendar               
            })
            .then(response => {
                resolve(response.result);
            })
            .catch(err => {
                reject(err);
            });

    });

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