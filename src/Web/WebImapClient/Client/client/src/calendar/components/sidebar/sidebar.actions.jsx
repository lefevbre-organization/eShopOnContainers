import { listCalendarList } from "../../api/calendar-api";
import {ActionTypes} from "../../../actions/action-types";
//import { setSearchQuery } from "../content/message-list/actions/message-list.actions";

export const GET_CALENDARS = "GET_CALENDARS";
export const SELECT_CALENDAR = "SELECT_CALENDAR";

export const getCalendars = calendars => {
    return {
      type: GET_CALENDARS,
      payload: calendars
  };
};

export const selectCalendar = calendarId => {
  return  {
    type: SELECT_CALENDAR,
    payload: calendarId
  };
};
