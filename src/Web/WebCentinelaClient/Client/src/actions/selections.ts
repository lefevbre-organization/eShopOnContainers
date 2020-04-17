// types of action
const Types = {
  SET_COMPANY_SELECTED: "SET_COMPANY_SELECTED",
  SET_TYPE_SELECTED: "SET_TYPE_SELECTED",
  SET_INITIAL_BBDD: "SET_INITIAL_BBDD",
  CLEAR_INITIAL_BBDD: "CLEAR_INITIAL_BBDD"
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

const setInitialBBDD = item => ({
  type: Types.SET_INITIAL_BBDD,
  payload: item
})

const clearInitialBBDD = () => ({
  type: Types.CLEAR_INITIAL_BBDD
})

export default {
  setCompanySelected,
  setTypeSelected,
  setInitialBBDD,
  clearInitialBBDD,
  Types
};
