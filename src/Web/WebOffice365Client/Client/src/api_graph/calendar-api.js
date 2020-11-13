import moment from 'moment';
import config from '../Config';
import { UserAgentApplication } from 'msal';

const graph = require('@microsoft/microsoft-graph-client');

const CalendarColors = [
    { value: 'lightBlue', color: '#0078d4', id : '0' },
    { value: 'lightGreen', color: '#498205', id: '1' },
    { value: 'lightOrange', color: '#da3b01', id: '2'},
    { value: 'lightGray', color: '#69797e', id: '3'},
    { value: 'lightYellow', color: '#ffff00', id: '4' },
    { value: 'lightTeal', color: '#18a7b5', id: '5' },
    { value: 'lightPink', color: '#e3008c', id: '6'},
    { value: 'lightBrown', color: '#b5651d', id: '7' },
    { value: 'lightRed', color: '#c50f1f', id: '8' }    
];

const PresetColors = [ 
    { value: 'preset0', color: '#E74856' },
    { value: 'preset1', color: '#FF8C00' },
    { value: 'preset2', color: '#FFAB45' },
    { value: 'preset3', color: '#FFF100' },
    { value: 'preset4', color: '#47D041' },
    { value: 'preset5', color: '#30C6CC' },
    { value: 'preset6', color: '#73AA24' },
    { value: 'preset7', color: '#00BCF2' },
    { value: 'preset8', color: '#8764B8' },
    //{ value: 'Preset9', color: '#30C6CC' },
    { value: 'preset10', color: '#A0AEB2' },
    { value: 'preset11', color: '#004B60' },
    { value: 'preset12', color: '#B1ADAB' },
    { value: 'preset13', color: '#5D5A58' },
    { value: 'preset14', color: '#000000' },
    { value: 'preset15', color: '#750B1C' },
];

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

// Categories

//Calendarlist Api
export const getEventTypes = () => {
    return new Promise(async (resolve, reject) => {
        const accessToken = await getAccessTokenSilent();
        const client = getAuthenticatedClient(accessToken);
        client
            .api(`/me/outlook/masterCategories`)
            .get()
            .then((response) =>
                resolve(GetEventTypeParser(response.value)))
            .catch((err) => {
                reject(err);
            });
    });
};

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

export const updateCalendarList = (calendarId, calendar) => {

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
};

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

export const getMeEventList = () => {
    return new Promise(async (resolve, reject) => {
        const accessToken = await getAccessTokenSilent();
        const client = getAuthenticatedClient(accessToken);
        client
            .api(`me/events/`)
            .get()
            .then((response) =>
                resolve(listEventsParser(response.value)))
            .catch((err) => {
                reject(err);
            });
    });
};


export const getEventList = (idCalendar, selectedDate) => {    
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

        event = EventParser(event);
      
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

export const updateCalendarEvent = (idCalendar, eventId, event) => {
    return new Promise(async (resolve, reject) => {

        event = EventParser(event);

        const accessToken = await getAccessTokenSilent();
        const client = getAuthenticatedClient(accessToken);
        client
            .api(`/me/events/${eventId}`)
            .update(event)
            .then((response) =>
                resolve(returnCreateEventParser(response)))
            .catch((err) => {
                reject(err);
            });
    });
};

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

export const requestRecurringEvent = (calendar, eventId) => {
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
};

// Acl api

//export const addAcl = (calendar, acl) => {
//    new Promise((resolve, reject) => {
//        window.gapi.client.calendar.acl
//            .insert({
//                calendarId: calendar,
//                sendNotifications: true,
//                resource: acl
//            })
//            .then(response => {
//                resolve(response.result);
//            })
//            .catch(err => {
//                reject(err);
//            });

//    });
//};

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

//export const deleteAcl = (calendar, ruleId) => {
//    new Promise((resolve, reject) => {
//        window.gapi.client.calendar.acl
//            .delete({
//                calendarId: calendar,
//                ruleId: ruleId
//            })
//            .then(response => {
//                resolve(response.result);
//            })
//            .catch(err => {
//                reject(err);
//            });

//    });
//};

// PARSERS

function GetEventTypeParser(list) {
    let listParse = [];

    if (list.length > 0) {
        for (let i = 0; i < list.length; i++) {
            listParse.push({
                color: PresetColors.find(x => x.value == list[i].color).color,
                idEvent: list[i].id,
                name: list[i].displayName,
            });
        }
    }
   
    let items;
    items = ({ eventTypes: listParse });

    let eventTypes;
    eventTypes = ({ data:items });

    return eventTypes;
}

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
                color = CalendarColors.find(x => x.value == list[i].color).color
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
}

function getCalendarParser(list) {
    let listParse = {
                summary: list.name                             
            };        
    return listParse;
}

function addCalendarParser(list) {
    let listParse = {};

    if (list.backgroundColor != undefined) {
        listParse.color = CalendarColors.find(x => x.color == list.backgroundColor).value

    }
    if (list.summary != undefined) {
        listParse.name = list.summary
    }

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

            let attendees = []
            if (list[i].attendees != undefined) {
                Object.keys(list[i].attendees).forEach(function (key) {
                    attendees.push(
                        { 'email': list[i].attendees[key].emailAddress.name }
                    );
                });
            }    

            let recurrenceRule = [] ;           
            if (list[i].recurrence != undefined) {               
                let str;
                let value;
                //pattern
                Object.keys(list[i].recurrence.pattern).forEach(function (key) {                   
                    value = list[i].recurrence.pattern[key]

                    let KeyPattern = key
                    let ValuePattern = value
                    switch (key) {                       
                        case "type":
                            KeyPattern = "FREQ";
                            break
                        case "daysOfWeek":
                            KeyPattern = "BYDAY"; 
                            let strv
                            value.forEach(element =>
                                strv = (typeof strv !== "undefined" ?  strv + "," + element : element )
                            );
                            strv = strv.replace("monday", "MO")
                            strv = strv.replace("tuesday", "TU")
                            strv = strv.replace("wednesday", "WE")
                            strv = strv.replace("thursday", "TH")
                            strv = strv.replace("friday", "FR")
                            strv = strv.replace("sunday", "SU")

                           // strv= strv.slice(0, -1)
                            console.log(strv)

                            ValuePattern = strv
                            break
                           
                    }

                   
                    str = (typeof str !== "undefined" ? str + KeyPattern + "=" + ValuePattern + ";" : KeyPattern + "=" + ValuePattern + ";");

                   // str= "FREQ=WEEKLY;COUNT=10;INTERVAL=1;BYDAY=MO,TU,TH"
                })
                //range
                Object.keys(list[i].recurrence.range).forEach(function (key2) {
                    switch (key2) {
                        case 'endDate':
                            value = list[i].recurrence.range[key2]
                            if (value != "0001-01-01") {
                                key2 = key2.replace("endDate", "UNTIL");                               
                                var dateStartTime = new Date(value);
                                // dateStartTime = dateStartTime.setDate(dateStartTime.getDate() + 1);
                                var dateString = moment(dateStartTime).seconds(0).toISOString().split('.')[0] + "Z";
                                var ExcRecurenceDate = dateString.replace(/[:.-]/g, "");
                                str = (str + key2 + "=" + ExcRecurenceDate + ";");
                            }                           
                            break;
                        default:
                        // code block
                    }               
                })

               // "RRULE:FREQ=DAILY;UNTIL=20201129T230000Z;INTERVAL=1"
                console.log(str);
                recurrenceRule.push("RRULE:" + str.toUpperCase())
                console.log(recurrenceRule[0]);
               // recurrenceRule.push("RRULE:FREQ=DAILY;MONTH=0;INDEX=1;INTERVAL=1")
            }
            else {
                recurrenceRule = null;
            }


            //EventType
            let category;
            if (list[i].categories != undefined && list[i].categories.length > 0 ) {
                category = {                   
                        private:
                        {
                            eventTypeColor: undefined,
                            eventTypeId: undefined,
                            eventTypeName: list[i].categories[0]
                        }
                };
            }
            else {
                category = undefined
            }


            listParse.push({                   
                id: list[i].id,
                summary: list[i].subject,
                location: list[i].location.displayName,
                description: list[i].bodyPreview,
                //start: { dateTime: StartDate, timeZone: list[i].start.timeZone },
                //end: { dateTime: EndDate, timeZone: list[i].end.timeZone },
                start: { dateTime: convertUTCDateToLocalDate(new Date(list[i].start.dateTime), list[i].isAllDay), timeZone: list[i].start.timeZone },
                end: { dateTime: convertUTCDateToLocalDate(new Date(list[i].end.dateTime), list[i].isAllDay), timeZone: list[i].end.timeZone },
                //start: { dateTime: list[i].start.dateTime, timeZone: list[i].start.timeZone },
                //end: { dateTime: list[i].end.dateTime, timeZone: list[i].end.timeZone },
                IsAllDay: list[i].isAllDay,
                isSensitivity: list[i].sensitivity === 'normal' ? false : true,
                recurrence: recurrenceRule,
                ImageName: "lefebvre",
                attendees: attendees,
                extendedProperties: category,                          
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

function EventParser(event) {
    let eventParse;

    var startDate = new Date(event.start.dateTime);
    var endDate = new Date(event.end.dateTime);
    
    if (event.isAllDay) {  
        startDate = moment(startDate).format('YYYY-MM-DD');
        endDate = moment(endDate).format('YYYY-MM-DD')
    }

    eventParse = {       

        subject: event.summary,
        body: {
            contentType: "HTML",
            content: event.description
        },
        start: {
            dateTime: startDate,
            timeZone: event.start.timeZone,
        },
        end: {
            dateTime: endDate,
            timeZone: event.end.timeZone,
        },
        location: {
            displayName: event.location
        },      

        IsAllDay: event.isAllDay,
        
        sensitivity: event.sensitivity
        //isReminderOn: true,
        //reminderMinutesBeforeStart: 1,

    };

    // Recurrence
    let rec
    if (event.recurrence != undefined) {
       rec = event.recurrence[0]   
        let recObj = rec.replace("RRULE:", "").split(";").slice(0, -1);

        var pattern = {};
        var range = {};
        
        Object.keys(recObj).forEach(function (key) {   
            if (recObj[key] != undefined) {
                let recJsonKey;
                let recJsonValue;
               // range['endDate'] = "2020-10-31"//Date.parse(event.end.dateTime);

                range['type'] = 'noEnd';
                range['startDate'] = formatDate(event.start.dateTime);
               
                switch (recObj[key].split("=")[0]) {
                    //pattern
                    case 'FREQ':
                        recJsonKey = recObj[key].split("=")[0].replace('FREQ', 'type').toLowerCase()
                        recJsonValue = recObj[key].split("=")[1];
                        pattern[recJsonKey] = recJsonValue;
                        break;

                    case 'INTERVAL':
                        recJsonKey = recObj[key].split("=")[0].replace('FREQ', 'type').toLowerCase()
                        recJsonValue = recObj[key].split("=")[1];
                        pattern[recJsonKey] = recJsonValue;

                        function getKeyByValue(object, value) {
                            return Object.keys(object).find(key => object[key] === value);
                        }

                        //if (getKeyByValue(pattern, "WEEKLY") != undefined) {

                        //        //pattern['daysOfWeek'] =
                        //        //    [
                        //        //        "Monday",
                        //        //        "Tuesday"
                        //        //    ]

                        //}

                        break;

                    case 'BYDAY':

                        let arr = []
                        let valueBYDAY = recObj[key].split("=")[1]
                       
                        valueBYDAY = valueBYDAY.replace("MO", "monday");
                        valueBYDAY = valueBYDAY.replace("TU", "tuesday");
                        valueBYDAY = valueBYDAY.replace("WE", "wednesday");
                        valueBYDAY = valueBYDAY.replace("TH", "thursday");
                        valueBYDAY = valueBYDAY.replace("FR", "friday");
                        valueBYDAY = valueBYDAY.replace("SU", "sunday");

                        valueBYDAY = valueBYDAY.split(",");

                        valueBYDAY.forEach(element =>  
                            arr.push(element),
                        );

                        pattern['daysOfWeek']= arr
                        console.log('daysOfWeek=' + arr);
                        break;
                    //range
                    case 'UNTIL':
                        //range['endDate'] = formatDate(event.end.dateTime)
                        recJsonKey = recObj[key].split("=")[0].replace('UNTIL', 'endDate')
                        recJsonValue = recObj[key].split("=")[1]; 
                        var dateRec = recJsonValue.substring(4, 0) + "-" + recJsonValue.substring(4, 6) + "-" + recJsonValue.substring(6, 8)
                        range[recJsonKey] = dateRec; 
                        delete range.type;
                        //range['type'] = 'noEnd';
                        break;
                    default:
                    // code block
                }               
            }           
        })
       
        let recurrence = {};
       // let item = {};
        
       // item.pattern = pattern;

        let item = {
            pattern,
            range
        }
        eventParse.recurrence = item;

       // recurrence.pattern = pattern;
       // eventParse.recurrence = recurrence;
        console.table(eventParse.recurrence);
        
    //    let item =
    //        {
    //            "pattern":
    //            {
    //                 "type": "weekly",
    //                 "interval": 2,
    //                    "daysOfWeek":
    //                        [
    //                         "Monday",
    //                         "Tuesday"
    //                        ]
    //            }
    //         }
        
             
    }

    //Atendees
    let arr = event.attendees
    let ateendeeObj = [];
    if (arr.length > 0) {
        Object.keys(arr).forEach(function (key) {
            let item = 
                {
                    emailAddress: {
                        address: arr[key].email,
                        name: ""
                    },
                    type: "required"
                } 
            ateendeeObj.push(item);
        });
    }
    eventParse.attendees = ateendeeObj;

    //Categories
    if (event.extendedProperties != undefined) {
        let item =
            [
            event.extendedProperties.private.eventTypeName 
            ]
        eventParse.categories = item;
        //event.eventype = cat
    }

    return eventParse;
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

function convertUTCDateToLocalDate(date, isAllDay) {
    var newDate = date
    if (!isAllDay) {
        newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);

        var offset = date.getTimezoneOffset() / 60;
        var hours = date.getHours();

        newDate.setHours(hours - offset);
    }  

    return newDate;
}
