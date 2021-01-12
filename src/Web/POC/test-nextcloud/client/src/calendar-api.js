import axios from 'axios';
import base64 from 'base-64';
import utf8 from 'utf8';
import Caldav from './vendor/caldavjs-nextcloud';

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
  return calendars.filter((c) => c.ctag !== undefined);
};

// Create Calendar
export const createCalendar = async () => {
  const cal = await caldav.createCalendar({
    name: 'NewCalendar',
    timezone: 'Europe/Madrid', // only to override settings
    filename: '/calendars/Alberto/NewCalendar',
    description: 'Calendario de prueba',
    color: 'red',
  });

  return cal;
};

// Get events
export const listEvents = async (calendar) => {
  const events = await caldav.listEvents({
    filename: calendar.replace(settings.basePath, ''),
    start: '20200601T000000Z',
  });
  return events;
};

// Create event
export const createEvent = async (calendar) => {
  const response = await caldav.createEvent({
    allDay: true,
    start: '2021-01-05',
    end: '2021-01-06',
    summary: Date.now(),
    filename: calendar + '/' + Date.now(),
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

export const createUser = async ({ name, password }) => {
  const auth = base64.encode(utf8.encode("admin:admin"));
  const params = new URLSearchParams();
  params.append('userid', name);
  params.append('password', password);

  const response = await axios.post(
    'http://localhost:8080/ocs/v1.php/cloud/users',
    params,
    {
      headers: { 
        'OCS-APIRequest':'true',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        Authorization: `Basic ${auth}` 
      }
    }
  );
  return response;
};

