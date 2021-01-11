import Caldav from 'caldavjs-nextcloud';

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
    filename: 'NewCalendar.ics',
    description: 'Calendario de prueba',
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
