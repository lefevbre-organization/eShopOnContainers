export const getStateStorage = () => {
  const lexon = localStorage.getItem("lexon");
  if (lexon === null) {
    return undefined;
  }
  return JSON.parse(lexon);
};

export const setStateStorage = state => {
  const lexonState = JSON.stringify(state);
  localStorage.setItem("lexon", lexonState);
};
