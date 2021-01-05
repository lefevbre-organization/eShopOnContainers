import { listCalendarList } from "../../../api/calendar-api";
//import { setSearchQuery } from "../content/message-list/actions/message-list.actions";

export const GET_CALENDARS = "GET_CALENDARS";
export const SELECT_CALENDAR = "SELECT_CALENDAR";

export const getCalendars = () => dispatch => {
  listCalendarList().then(calendarList => {
    dispatch({
      type: GET_CALENDARS,
      payload: calendarList.items
    });
  });
};

export const selectCalendar = calendarId => dispatch => {
  //dispatch(setSearchQuery(""));
  dispatch({
    type: SELECT_CALENDAR,
    payload: calendarId
  });
};
