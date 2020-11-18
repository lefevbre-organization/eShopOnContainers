// types of action
const Types = {
  SET_COMPANY_SELECTED: "SET_COMPANY_SELECTED",
  SET_TYPE_SELECTED: "SET_TYPE_SELECTED",
  SET_INITIAL_BBDD: "SET_INITIAL_BBDD",
  SET_PROVIDER: "SET_PROVIDER",
  SET_USER: "SET_USER",
  SET_APP: "SET_APP",
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

const setProvider = item => ({
  type: Types.SET_PROVIDER,
  payload: item
})

const setUser = item => ({
  type: Types.SET_USER,
  payload: item
})

const setApp = item => ({
  type: Types.SET_APP,
  payload: item
})

const clearInitialBBDD = () => ({
  type: Types.CLEAR_INITIAL_BBDD
})

export default {
  setCompanySelected,
  setTypeSelected,
  setInitialBBDD,
  setProvider,
  setUser,
  setApp,
  clearInitialBBDD,
  Types
};
