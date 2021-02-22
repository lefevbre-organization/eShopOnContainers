import Caldav from '../../services/caldavjs-nextcloud';
import moment from 'moment';
import axios from 'axios';
import base64 from 'base-64';
import utf8 from 'utf8';

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
  username: window.NEXTCOUD_ADMIN_USERNAME,
  password: window.NEXTCLOUD_ADMIN_PASSWD,
  server: window.NEXTCLOUD_URL,
  basePath: '/remote.php/dav',
  timezone: 'Europe/Madrid',
  principalPath: '/principals/users',
  parserLogging: true
};

let attendees = [];

export const caldav = new Caldav(settings);

// Get calendars
export const listCalendarList = async () => {
  const calendars = await caldav.listCalendars({});
  return listCalendarParser(calendars.filter(c => c.ctag !== undefined));
};

// Create Calendar
export const createCalendar = async calendar => {
  const cal = await caldav.createCalendar({
    name: calendar.summary,
    timezone: 'Europe/Madrid', // only to override settings
    filename: `/calendars/admin/${calendar.summary}`,
    color: calendar.color,
    description: calendar.description
  });
  return cal;
};

// Update Calendar
export const updateCalendarList = async (calendarId, calendar) => {
  const cal = await caldav.updateCalendar({
    name: calendar.summary,
    timezone: 'Europe/Madrid', // only to override settings
    filename: calendarId,
    color: calendar.backgroundColor,
    description: calendar.description
  });
  return cal;
};

// Deelte Calendar

export const deleteCalendar = async calendar => {
  const cal = await caldav.deleteCalendar({
    filename: calendar
  });
  return cal;
};

// Get events to deprecate
export const listEvents = async calendar => {
  const events = await caldav.listEvents({
    filename: calendar.replace(settings.basePath, ''),
    start: '20200601T000000Z',
    end: "20240630T115959Z"
  });
  return listEventsParser(events);
};

// Get events
export const getEventList = async (calendar, selectedDate) => {
  const events = await caldav.listEvents({
    filename: calendar.replace(settings.basePath, ''),
    start: '20200601T000000Z',
    end: "20240630T115959Z"
  });
  return listEventsParser(events);
};

// Create and update event
export const addCalendarEvent = async (calendar, event) => {
  const response = await caldav.createEvent(event);
  return response;
};

export const deleteCalendarEvent = async filename => {
  const response = await caldav.deleteEvent({
    filename: filename
  });
  return response;
};

function listEventsParser(list) {

  const listParse = [];
  if (list.length > 0) {
    for (let i = 0; i < list.length; i++) {
      attendees = [];
      let recurrenceRule = [];
      if (list[i].json.RRULE != undefined) {
        recurrenceRule = [`RRULE:${list[i].json.RRULE}`];
      } else {
        recurrenceRule = null;
      }

      getAttendees(list[i].json, attendees);
      listParse.push({
        id: list[i].href,
        filename: list[i].href,
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
        recurrence: recurrenceRule,
        ImageName: "lefebvre",
        attendees: attendees,
        categories: list[i].categories,
        color: list[i].color,
        lexonActuation: list[i].lexonActuation
      });
    }
  }

  let result;
  let items;
  items = ({ items: listParse });
  result = ({ result: items });

  return result;
}

function getAttendees(json, attendees) {
  if(!attendees || attendees.length === 0) {
    return;
  }

  for (const key in json) {
    if (json.hasOwnProperty(key)) {
      const attende = json[key];
      if (attende != undefined) {
        const emails = attende.split(':');
        if (emails.length === 3) {
          getEmails(emails[2], attendees);
        }
      }
    }
  }
}

function getEmails(email, attendees) {
  attendees.push({
    email: email,
    responseStatus: "needsAction"
  });
  return attendees;
}

function convertUTCDateToLocalDate(date, isAllDay) {
  let newDate = date;
  if (!isAllDay) {
    newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);

    const offset = date.getTimezoneOffset() / 60;
    const hours = date.getHours();

    newDate.setHours(hours - offset);
  }

  return newDate;
}

function formatDate(date) {
  let d = new Date(date),
    month = `${d.getMonth() + 1}`,
    day = `${d.getDate()}`,
    year = d.getFullYear();

  if (month.length < 2) {
    month = `0${month}`;
  }
  if (day.length < 2) {
    day = `0${day}`;
  }

  return [year, month, day].join('-');
}

function listCalendarParser(list) {
  const listParse = [];

  if (list.length > 0) {
    for (let i = 0; i < list.length; i++) {
      //let roll;
      //if (list[i].canShare) {
      //    roll = "owner";
      //}
      const roll = "owner";

      //let primary = false;
      //if (list[i].canShare && !list[i].isRemovable) {
      //    primary = true
      //}
      //else {
      //    primary = undefined
      //}
      const primary = false;
      let color = "";
      if (list[i].color) {
        color = list[i].color._;
      } else {
        color = "#0693e3";
      }

      let selected = true;
      if (i > 0) {
        selected = false;
      }


      //if (list[i].color != "auto") {
      //  color = CalendarColors.find(x => x.value == list[i].color).color
      // }

      listParse.push({
        accessRole: roll,
        backgroundColor: color,
        colorId: color,
        defaultReminders: [],
        id: list[i].href,
        primary: primary,
        selected: selected,
        summary: list[i].name,
        description: list[i].description,
        timeZone: "Europe/Madrid"
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

export const createCalendarUser = async name => {
  const auth = base64.encode(utf8.encode(`${window.NEXTCOUD_ADMIN_USERNAME}:${window.NEXTCLOUD_ADMIN_PASSWD}`));
  const params = new URLSearchParams();
  params.append('userid', name);
  params.append('password', window.NEXTCLOUD_USERS_PASSWD);

  const response = await axios.post(
    `${window.NEXTCLOUD_URL}/ocs/v1.php/cloud/users`,
    params,
    {
      headers: {
        'OCS-APIRequest': 'true',
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        Authorization: `Basic ${auth}`
      }
    }
  );
  return response;
};
