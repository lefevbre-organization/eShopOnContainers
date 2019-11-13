// types of action
const Types = {
  SET_COMPANY_SELECTED: "SET_COMPANY_SELECTED"
};

// actions
const setCompanySelected = item => ({
  type: Types.SET_COMPANY_SELECTED,
  payload: item
});

export default {
  setCompanySelected,
  Types
};
