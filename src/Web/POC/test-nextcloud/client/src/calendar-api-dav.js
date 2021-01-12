const dav = require('dav');

const xhr = new dav.transport.Basic(
  new dav.Credentials({
    username: 'demo',
    password: 'fHLYU874sMpN8uE',
  })
);

export const listCalendarList = async () => {
  const client = new dav.Client(xhr);
  const account = await client.createAccount({
    server: 'http://localhost:8080/remote.php/dav/',
    accountType: 'caldav',
  });

  return account.calendars;
};

export const getCalendarList = async (calendar) => {
  const client = new dav.Client(xhr);
  const cal = await client.syncCalendar(calendar);
  return cal;
};

export const getEventList = async (calendar) => {
  const client = new dav.Client(xhr);

  const account = await client.createAccount({
    server: 'http://localhost:8080/remote.php/dav/',
    accountType: 'caldav',
  });

  const events = await account.calendars[0].listCalendarObjects(calendar);
  return events;
};

export const createCalendar = async (calendar) => {};
