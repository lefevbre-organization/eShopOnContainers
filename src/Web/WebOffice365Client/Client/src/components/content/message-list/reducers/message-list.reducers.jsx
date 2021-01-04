import {
  GET_MESSAGES,
  GET_MESSAGES_FAILED,
  TOGGLE_SELECTED,
  MESSAGE_LOAD_IN_PROGRESS,
  MESSAGE_LOAD_SUCCESS,
  MESSAGE_LOAD_FAIL,
  MESSAGE_HEADER_LOAD_IN_PROGRESS,
  MESSAGE_HEADER_LOAD_SUCCESS,
  MESSAGE_HEADER_LOAD_FAIL,
  GET_MESSAGES_LOAD_IN_PROGRESS,
  EMPTY_MESSAGES,
  SET_PAGE_TOKENS,
  ADD_INITIAL_PAGE_TOKEN,
  CLEAR_PAGE_TOKENS,
  MODIFY_MESSAGES_SUCCESS,
  SET_SEARCH_QUERY,
  ADD_MESSAGE,
  DELETE_MESSAGE,
  DELETE_LIST_MESSAGES,
  CLEAR_LIST_MESSAGES,
  SET_OPEN_MESSAGE,
  ADD_LIST_MESSAGES,
  ADD_OPEN_MESSAGE_ATTACHMENT,
  CLEAR_OPEN_MESSAGE_ATTACHMENT,
  REMOVE_MESSAGE_FROM_LIST,
    UPDATE_COMPOSER_DATA
} from '../actions/message-list.actions';

const defaultMessagesState = {
  messages: [],
  loading: true,
  pageTokens: [],
  paginatioDirectionSelected: null,
  openMessageAttachments: [],
};

export const messagesResult = (state = defaultMessagesState, action) => {
  switch (action.type) {
    case GET_MESSAGES:
      const stateClone = { ...state };
      stateClone.nextPageToken = null;
      const pageTokens = [...stateClone.pageTokens];
      const nextPageToken = action.payload['@odata.nextLink'];

      if (nextPageToken && pageTokens.indexOf(nextPageToken) === -1) {
        pageTokens.push(nextPageToken);
      }
      console.log('pageTokens ->', pageTokens);
      return {
        ...stateClone,
        ...action.payload,
        loading: false,
        pageTokens: pageTokens,
      };
    case GET_MESSAGES_FAILED: {
      return {
        ...state,
        loading: false,
        failed: true,
        error: action.payload,
      };
    }
    case EMPTY_MESSAGES:
      return { ...state, messages: [] };
    case GET_MESSAGES_LOAD_IN_PROGRESS:
      return {
        ...state,
        label: null,
        nextPageToken: null,
        loading: true,
      };
    case TOGGLE_SELECTED:
      return {
        ...state,
        messages: state.messages.map((el) => {
          if (action.payload.messageIds.indexOf(el.id) > -1) {
            return { ...el, selected: action.payload.selected };
          }
          return el;
        }),
      };
    case ADD_INITIAL_PAGE_TOKEN:
      return {
        ...state,
        pageTokens: [action.payload],
      };
    case CLEAR_PAGE_TOKENS:
      return {
        ...state,
        pageTokens: [],
      };
    case MODIFY_MESSAGES_SUCCESS:
      if (action.payload.addLabelIds.indexOf('TRASH') > -1) {
        return {
          ...state,
          messages: state.messages.filter(
            (el) => action.payload.modifiedIds.indexOf(el.id) === -1
          ),
        };
      } else if (action.payload.addLabelIds.indexOf('UNREAD') > -1) {
        const newState = {
          ...state,
          messages: state.messages.map((msg) => {
            if (action.payload.modifiedIds.indexOf(msg.id) > -1) {
              return { ...msg, isRead: false };
            }
            return msg;
          }),
        };

        return newState;
      } else if (action.payload.removeLabelIds.indexOf('UNREAD') > -1) {
        const newState = {
          ...state,
          messages: state.messages.map((msg) => {
            if (action.payload.modifiedIds.indexOf(msg.id) > -1) {
              return {
                ...msg,
                isRead: true,
              };
            }
            return msg;
          }),
        };

        return newState;
      }
      return { ...state };

    case SET_OPEN_MESSAGE:
      if (state.openMessage === action.payload) {
        return state;
      }

      return {
        ...state,
        openMessage: action.payload,
      };

    case ADD_OPEN_MESSAGE_ATTACHMENT:
      const attachments = state.openMessageAttachments;
      return {
        ...state,
        openMessageAttachments: [...attachments, action.payload],
      };
    case CLEAR_OPEN_MESSAGE_ATTACHMENT:
      return {
        ...state,
        openMessageAttachments: [],
      };
    case REMOVE_MESSAGE_FROM_LIST:
      const aux = state.messages.filter( msg => msg.id !== action.payload);
      return {
        ...state,
        messages: [...aux]
      }
      break;
    default:
      return state;
  }
};

export const pageTokens = (
  state = { prevPageToken: '', nextPageToken: '' },
  action
) => {
  switch (action.type) {
    case SET_PAGE_TOKENS:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

const defaultEmailMessageResult = {
  body: '',
  loading: false,
  failed: false,
};

export const emailMessageResult = (
  state = defaultEmailMessageResult,
  action
) => {
  switch (action.type) {
    case GET_MESSAGES_LOAD_IN_PROGRESS:
    case MESSAGE_LOAD_IN_PROGRESS:
      return { ...state, body: '', loading: true, failed: false };
    case MESSAGE_LOAD_SUCCESS:
      return {
        ...state,
        ...action.payload,
        loading: false,
        failed: false,
      };
    case MESSAGE_LOAD_FAIL:
      return {
        ...state,
        loading: false,
        failed: true,
        error: action.payload,
      };
    default:
      return state;
  }
};

const defaultEmailHeaderMessageResult = {
  headers: null,
  loading: false,
  failed: false,
};

export const emailHeaderMessageResult = (
  state = defaultEmailHeaderMessageResult,
  action
) => {
  switch (action.type) {
    case MESSAGE_HEADER_LOAD_IN_PROGRESS:
      return { ...state, headers: null, loading: true, failed: false };
    case MESSAGE_HEADER_LOAD_SUCCESS:
      return {
        ...state,
        headers: action.payload,
        loading: false,
        failed: false,
      };
    case MESSAGE_HEADER_LOAD_FAIL:
      return {
        ...state,
        headers: null,
        loading: false,
        failed: true,
        error: action.payload,
      };
    default:
      return state;
  }
};

export const searchQuery = (state = '', action) => {
  switch (action.type) {
    case SET_SEARCH_QUERY:
      return action.payload;
    default:
      return state;
  }
};

const defaultMessageList = {
  selectedMessages: [],
};

export function messageList(state = defaultMessageList, action) {
  switch (action.type) {
    case ADD_MESSAGE: {
      return {
        ...state,
        selectedMessages: [
          ...state.selectedMessages.filter(
            (msg) => msg.extMessageId !== action.data.extMessageId
          ),
          action.data,
        ],
      };
    }

    case DELETE_MESSAGE: {
      return {
        ...state,
        selectedMessages: state.selectedMessages.filter(
          (message) => message.extMessageId !== action.data.id
        ),
      };
    }

    case DELETE_LIST_MESSAGES: {
      for (let i = 0; i < action.listMessages.length; i++) {
        const index = state.selectedMessages.findIndex(
          (message) => message.extMessageId === action.listMessages[i]
        );
        if (index > -1) {
          state.selectedMessages.splice(index, 1);
        }
      }
      return {
        ...state,
        selectedMessages: [...state.selectedMessages],
      };
    }

    case ADD_LIST_MESSAGES: {
      for (let i = 0; i < action.listMessages.length; i++) {
        const index = state.selectedMessages.findIndex(
          (message) =>
            message.extMessageId === action.listMessages[i].extMessageId
        );
        if (index === -1) {
          const data = {
            id: action.listMessages[i].id,
            extMessageId: action.listMessages[i].extMessageId,
            subject: action.listMessages[i].subject,
            sentDateTime: action.listMessages[i].sentDateTime,
          };
          state.selectedMessages.push(data);
        }
      }
      return {
        ...state,
        selectedMessages: [...state.selectedMessages],
      };
    }

    case CLEAR_LIST_MESSAGES: {
      return {
        ...state,
        selectedMessages: [],
      };
    }

    default:
      return state;
  }
}

export const composer = (
    state = {},
    action
) => {
  switch (action.type) {
    case UPDATE_COMPOSER_DATA:
      return action.payload
    default:
      return state
  }
}
