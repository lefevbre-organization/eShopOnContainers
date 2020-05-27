export const getStateStorage = () => {
  let lexon = localStorage.getItem('lexon');
  let currentUser = localStorage.getItem('current_user');
  if (lexon === null) {
    lexon = undefined;
  }

  if (currentUser === null) {
    currentUser = undefined;
  }

  return {
    lexon: JSON.parse(lexon),
    currentUser: JSON.parse(currentUser),
  };
};

export const setStateStorage = ({ lexon, currentUser }) => {
  if (lexon) {
    const lexonState = JSON.stringify(lexon);
    localStorage.setItem('lexon', lexonState);
  }

  if (currentUser) {
    const current_user = JSON.stringify(currentUser);
    localStorage.setItem('current_user', current_user);
  }
};
