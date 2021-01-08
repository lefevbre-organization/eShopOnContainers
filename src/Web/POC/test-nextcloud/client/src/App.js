import { useState } from 'react';
import './App.css';
import {
  listCalendarList,
  listEvents,
  createCalendar,
  createEvent,
  deleteEvent,
} from './calendar-api';

function App() {
  const [calendars, setCalendars] = useState([]);
  const [events, setEvents] = useState([]);

  const handleListCalendars = async () => {
    const calendars = await listCalendarList();
    setCalendars(calendars);
  };

  const handleGetEvents = async () => {
    const events = await listEvents(calendars[0].href);
    setEvents(events);
  };

  const handleCreateCalendar = async () => {
    const events = await createCalendar({
      name: 'NewCalendar',
      description: 'New test calendar',
    });
    console.log(events);
  };

  const handleCreateEvent = async () => {
    const event = await createEvent(calendars[0].href);
    console.log(event);
    //setEvents(events);
  };

  const handleDeleteEvent = async () => {
    const event = await deleteEvent(
      calendars[0].href + '/unique-filename-for-this-event'
    );
    console.log(event);
    //setEvents(events);
  };

  return (
    <div className='App'>
      <header className='App-header'>
        <div>
          <button onClick={handleListCalendars}>Get Calendars</button>
          <button onClick={handleCreateCalendar}>Create Calendar</button>
          <button onClick={handleGetEvents}>Get Events</button>
          <button onClick={handleCreateEvent}>Create Event</button>
          <button onClick={handleDeleteEvent}>Delete Event</button>
        </div>
      </header>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1 }}>
          {calendars.map((c) => (
            <p>{c.href}</p>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          {events.map((e) => (
            <p>{e.summary}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
