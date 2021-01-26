import Caldav from 'caldavjs-nextcloud';
import moment from 'moment';

const CalendarColors = [
    { value: 'lightBlue', color: '#0078d4', id: '0' },
    { value: 'lightGreen', color: '#498205', id: '1' },
    { value: 'lightOrange', color: '#da3b01', id: '2' },
    { value: 'lightGray', color: '#69797e', id: '3' },
    { value: 'lightYellow', color: '#ffff00', id: '4' },
    { value: 'lightTeal', color: '#18a7b5', id: '5' },
    { value: 'lightPink', color: '#e3008c', id: '6' },
    { value: 'lightBrown', color: '#b5651d', id: '7' },
    { value: 'lightRed', color: '#c50f1f', id: '8' }
];

const settings = {
  username: 'Alberto',
  password: 'Alberto1971.-',
  server: 'http://localhost:8080',
  basePath: '/remote.php/dav',
  timezone: 'Europe/Madrid',
  principalPath: '/principals/users',
  parserLogging: true,
};

export const caldav = new Caldav(settings);

// Get calendars
export const listCalendarList = async () => {
    const calendars = await caldav.listCalendars({});    
   // calendars = calendars.filter((c) => c.ctag !== undefined);
    return listCalendarParser(calendars.filter((c) => c.ctag !== undefined))
};

// Create Calendar
export const createCalendar = async (calendar) => {    
    const cal = await caldav.createCalendar({
        name: calendar.summary,
        timezone: 'Europe/Madrid', // only to override settings
        filename: `/calendars/alberto/${calendar.summary}`,
        description: calendar.description        
    });   
    console.log(calendar)
    return cal;
};

// Deelte Calendar

export const deleteCalendar = async (calendar) => {

    const cal = await caldav.deleteCalendar({       
        filename: calendar     
    });
    console.log(calendar)
    return cal;
};

// Get events to deprecate
export const listEvents = async (calendar) => {
  const events = await caldav.listEvents({
    filename: calendar.replace(settings.basePath, ''),
      start: '20200601T000000Z',
      end: "20240630T115959Z",
  });
    return listEventsParser(events);
};

// Get events
export const getEventList = async (calendar, selectedDate) => {
    const events = await caldav.listEvents({
        filename: calendar.replace(settings.basePath, ''),
        start: '20200601T000000Z',
        end: "20240630T115959Z",
    });
    return listEventsParser(events);
};

// Create event
export const createEvent = async (calendar) => {
  const response = await caldav.createEvent({
    allDay: true,
    start: '2021-01-05',
    end: '2021-01-06',
    summary: 'title',
    filename: calendar + '/unique-filename-for-this-event',
    location: 'wherever',
    description: 'tell them about it',
    timezone: 'Europe/Madrid', //only to override settings
    color: 'green',
  });

  return response;
};

export const deleteEvent = async (filename) => {
  const response = await caldav.deleteEvent({ filename });
  return response;
};


function listEventsParser(list) {


    //allDay: true
    //calendarData: "BEGIN:VCALENDAR↵PRODID:-//IDN nextcloud.com//Calendar app 2.1.3//EN↵CALSCALE:GREGORIAN↵VERSION:2.0↵BEGIN:VEVENT↵CREATED:20210108T155756Z↵DTSTAMP:20210108T155801Z↵LAST-MODIFIED:20210108T155801Z↵SEQUENCE:2↵UID:eed9b1c1-4b37-41e5-a460-de783317d4bc↵DTSTART;VALUE=DATE:20210108↵DTEND;VALUE=DATE:20210109↵SUMMARY:prueba↵END:VEVENT↵END:VCALENDAR"
    //categories: undefined
    //color: undefined
    //description: undefined
    //end: "20210109"
    //etag: "3e6884ba94ab190285f9d9731d4ceb62"
    //href: "/remote.php/dav/calendars/alberto/personal/50EB1A0D-49CC-4BF7-8D9F-0A819A561BCE.ics"
    //json: { CREATED: "20210108T155756Z", DTSTAMP: "20210108T155801Z", LAST - MODIFIED: "20210108T155801Z", SEQUENCE: "2", UID: "eed9b1c1-4b37-41e5-a460-de783317d4bc", … }
    //location: undefined
    //start: "20210108"
    //summary: "prueba"
    //__proto__: Object


    let listParse = [];

    if (list.length > 0) {

        for (let i = 0; i < list.length; i++) {   
            listParse.push({
                id: list[i].etag,
                summary: list[i].summary,
                location: list[i].location,
                description: list[i].description,
                start: { dateTime: moment(list[i].start), timeZone: 'Europe/Madrid' },
                end: { dateTime: moment(list[i].end), timeZone: 'Europe/Madrid' },
               // start: { dateTime: convertUTCDateToLocalDate(new Date(list[i].start), list[i].allDay), timeZone: 'Europe/Madrid' },
               // end: { dateTime: convertUTCDateToLocalDate(new Date(list[i].end), list[i].allDay), timeZone: 'Europe/Madrid' },
                //start: { dateTime: list[i].start.dateTime, timeZone: list[i].start.timeZone },
                //end: { dateTime: list[i].end.dateTime, timeZone: list[i].end.timeZone },
                IsAllDay: list[i].allDay,
                //isSensitivity: list[i].sensitivity === 'normal' ? false : true,
               // recurrence: recurrenceRule,
                ImageName: "lefebvre",
                //attendees: attendees,
               // extendedProperties: category,
            });
        }
    }

    let result;
    let items;
    items = ({ items: listParse });
    result = ({ result: items });

    return result
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

function listCalendarParser(list) {
    let listParse = [];

    if (list.length > 0) {
        for (let i = 0; i < list.length; i++) {

            //let roll;
            //if (list[i].canShare) {
            //    roll = "owner";
            //}
            let roll = "owner";

            //let primary = false;
            //if (list[i].canShare && !list[i].isRemovable) {
            //    primary = true
            //}
            //else {
            //    primary = undefined
            //}
            let primary = true;

            let color = "#0693e3";
           //if (list[i].color != "auto") {
              //  color = CalendarColors.find(x => x.value == list[i].color).color
           // }

            listParse.push({
                accessRole: roll,
                backgroundColor: color,
                //colorId: "16",          
                colorId: list[i].color,
                defaultReminders: [],
                id: list[i].href,
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


//loadCalendarEvents(calendar, checked) {
//    listEvents(calendar/*, this.scheduleObj.selectedDate*/)
//        .then(result => {
//            this.dataManager = result.result;
//            this.onDataBinding(this.dataManager, calendar);
//            this.scheduleObj.dataBind(this.scheduleData);
//            this.scheduleObj.refreshEvents();
//        })
//        .catch(error => {
//            console.log('error ->', error);
//        })

//}
