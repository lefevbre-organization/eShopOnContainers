export const createAppoinment = async (bbdd, user, event) => {
    let url = `${window.API_GATEWAY}/api/v1/lex/Actuations/${user.idUser}/${bbdd}/appointments`;
    if(window.currentEnv) {
        url = `${url}?env=${window.currentEnv}`
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                bbdd,
                subject: event.Subject,
                idEvent: event.Guid,
                provider: user.provider,
                startDate: event.StartTime,
                endDate: event.EndTime,
                calendar: {
                    title: event.calendar.summary,
                    description: '',
                    color: event.calendar.backgroundColor,
                    fgColor: event.calendar.foregroundColor
                },
                eventType: event.EventType?{
                    name: event.EventType.eventTypeName,
                    color: event.EventType.eventTypeColor
                }:undefined,
                reminders: event.Reminders && event.Reminders.overrides?event.Reminders.overrides.map( e => ({ method: e.method, minutesBefore: e.minutes })):[]
            }),
        });
        const result = await response.json();

        return { result };
    } catch (err) {
        throw err;
    }
};

export const addEventToActuation = async (bbdd, idUser, eventId, actuationId) => {
    let url = `${window.API_GATEWAY}/api/v1/lex/Actuations/${idUser}/${bbdd}/appointments/${eventId}/relation/${actuationId}`;
    if(window.currentEnv) {
        url = `${url}?env=${window.currentEnv}`
    }
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        });
        const result = await response.json();

        return { result };
    } catch (err) {
        throw err;
    }
};