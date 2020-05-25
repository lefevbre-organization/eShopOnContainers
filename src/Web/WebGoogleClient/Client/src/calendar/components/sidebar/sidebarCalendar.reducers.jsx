import { GET_CALENDARS, SELECT_CALENDAR } from "./sidebar.actions";

const defaultCalendarState = {
  calendars: []
};

export const calendarsResult = (state = defaultCalendarState, action) => {
  switch (action.type) {
    case GET_CALENDARS:
      return {
        ...state,
        calendars: action.payload
      };
    case SELECT_CALENDAR:
      return {
        ...state,
        calendars: state.calendars.map(el => {
          if (el.id === action.payload) {
            return {
              ...el,
              selected: true
            };
          }
          return {
            ...el,
            selected: false
          };
        })
      };
    default:
      return state;
  }
};
