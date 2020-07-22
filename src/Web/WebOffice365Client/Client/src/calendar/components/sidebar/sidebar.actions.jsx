import { listCalendarList } from "../../../api_graph/calendar-api";
//import { setSearchQuery } from "../content/message-list/actions/message-list.actions";

export const GET_CALENDARS = "GET_CALENDARS";
export const SELECT_CALENDAR = "SELECT_CALENDAR";


export const getCalendars = () => dispatch => {
  listCalendarList().then(calendarList => {
    dispatch({
      type: GET_CALENDARS,
        payload: calendarParser(calendarList.value)
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

function calendarParser(list) {
    let listParse = [];
    if (list.length > 0) {
        for (let i = 0; i < list.length; i++) {

            let roll;
            if (list[i].canShare) {
                roll = "owner";
            }

            let primary=false;
            if (list[i].canShare && !list[i].isRemovable) {
                primary = true
            }
            else {
                primary = undefined
            }

            let color = "#0693e3";
            if (list[i].color != "auto") {
                color = list[i].color
            }
            

            listParse.push({
            accessRole: roll,
            backgroundColor: color,
            //colorId: "16",          
            colorId: list[i].color,
            defaultReminders: [],           
            id: list[0].id,           
            primary: primary,
            selected: primary,
            summary: list[i].name,
            timeZone: "Europe/Madrid",
            });
        }
    }
    return listParse;
}

//allowedOnlineMeetingProviders: (2)["teamsForBusiness", "skypeForBusiness"]
//canEdit: true
//canShare: true
//canViewPrivateItems: true
//changeKey: "HJwYii8JSkK74gfF5MMWnAAAAAABmg=="
//color: "auto"
//defaultOnlineMeetingProvider: "skypeForBusiness"
//id: "AAMkADYwN2U5OWZlLWUwZDktNDQ3Yi05MTQ2LTMxYmUyMGExMjcwNgBGAAAAAAABGTrist65R5XlVfmY3KAqBwAcnBiKLwlKQrviB8XkwxacAAAAAAEGAAAcnBiKLwlKQrviB8XkwxacAAAAAB05AAA="
//isRemovable: false
//isTallyingResponses: true
//name: "Calendario"
//owner: { name: "Alberto VALVERDE", address: "a.valverde-ext@lefebvre.es" }
//__proto__: Object
