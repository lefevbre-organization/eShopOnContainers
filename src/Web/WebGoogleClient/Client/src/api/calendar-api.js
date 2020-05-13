﻿/**
 * Load Google Calendar Events
 */
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


export const listCalendarList = () =>
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

export const addCalendar = (event) =>
    new Promise((resolve, reject) => {
        window.gapi.client.calendar.calendars
            .insert({               
                resource: event
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

export const updateCalendar = (calendar, event) =>
    new Promise((resolve, reject) => {
        window.gapi.client.calendar.calendars
            .update({
                calendarId: calendar,               
                resource: event
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
                calendarId: calendar ,
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
                calendarId: calendar,
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

export const addACL = (calendar, acl) =>
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


export const listACL = (calendar) =>
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

export const deleteACL = (calendar, ruleId) =>
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