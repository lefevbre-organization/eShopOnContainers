// types of action
const Types = {
  SET_COMPANY_SELECTED: "SET_COMPANY_SELECTED",
  SET_TYPE_SELECTED: "SET_TYPE_SELECTED"
};

// actions
const setCompanySelected = item => ({
  type: Types.SET_COMPANY_SELECTED,
  payload: item
});

const setTypeSelected = item => ({
  type: Types.SET_TYPE_SELECTED,
  payload: item
});

export default {
  setCompanySelected,
  setTypeSelected,
  Types
};
