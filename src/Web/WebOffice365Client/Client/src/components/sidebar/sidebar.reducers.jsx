import {GET_LABELS, SELECT_LABEL, INBOX_LABEL, SPECIAL_LABEL} from "./sidebar.actions";

const defaultLabelState = {
  labels: [],
  labelInbox: null,
  specialFolders: []
};

export const labelsResult = (state = defaultLabelState, action) => {
  switch (action.type) {
    case GET_LABELS:
      return {
        ...state,
        labels: action.payload
      };
    case SELECT_LABEL:
      return {
        ...state,
        labels: state.labels.map(el => {
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
    case INBOX_LABEL:
      return {
        ...state,
        labelInbox: action.payload
      };
    case SPECIAL_LABEL:
      const sf = [ ...state.specialFolders ];
      sf[action.payload.name] = action.payload;
      const ns =  {
        ...state,
        specialFolders: [...sf]
      };
      if(action.payload.name === 'inbox') {
        ns.labelInbox = action.payload;
      }

      return ns;
    default:
      return state;
  }
};
