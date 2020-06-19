import { calendarsResult } from "./calendar/components/sidebar/sidebarCalendar.reducers";

export const getStateStorage = () => {
  let lexon = localStorage.getItem('lexon');
  let currentUser = localStorage.getItem('current_user');
  let calendarsResult = localStorage.getItem('calendarsResult');
  if (lexon === null) {
    lexon = undefined;
  }

  if (currentUser === null) {
    currentUser = undefined;
  }

  if (calendarsResult === null){
    calendarsResult = undefined;
  }

  return {
    lexon: lexon ? JSON.parse(lexon) : undefined,
    currentUser: currentUser ? JSON.parse(currentUser) : undefined,
    calendarsResult: calendarsResult ? JSON.parse(calendarsResult) : undefined
  };
};

export const setStateStorage = ({ lexon, currentUser, calendarsResult }) => {
  if (lexon) {
    const lexonState = JSON.stringify(lexon);
    localStorage.setItem('lexon', lexonState);
  }

  if (currentUser) {
    const current_user = JSON.stringify(currentUser);
    localStorage.setItem('current_user', current_user);
  }

  if (calendarsResult){
    const calendarsResultState = JSON.stringify(calendarsResult);
    localStorage.setItem('calendarsResult', calendarsResultState)
  }
};
