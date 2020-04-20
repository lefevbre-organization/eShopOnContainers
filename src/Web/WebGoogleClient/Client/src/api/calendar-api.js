/**
 * Load Google Calendar Events
 */
export const getEventList = (idCalendar) =>
    new Promise((resolve, reject) => {
        window.gapi.client.calendar.events
            .list({
                calendarId: idCalendar,
                //timeMin: (new Date()).toISOString(),
                //maxResults: 10,
                singleEvents: true,
                orderBy: 'startTime',
            })
            .then(response => {
                resolve(response)
            })
            .catch(error => {
                reject(error);
            });
    });


export const getCalendarList = () =>
    new Promise((resolve, reject) => {
        window.gapi.client.calendar.calendarList
            .list({

            })

            .then(response => {
                resolve(response.result);
            })
            .catch(err => {
                reject(err);
            });

    });

export const addCalendarEvent = (calendar, event) =>
    new Promise((resolve, reject) => {
        window.gapi.client.calendar.events
            .insert({
                calendarId: "primary",
                resource: event
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
                calendarId: "primary",
                eventId: eventId,
                resource: event
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
                calendarId: "primary",
                eventId: eventId
            })

            .then(response => {
                resolve(response.result);
            })
            .catch(err => {
                reject(err);
            });

    });
