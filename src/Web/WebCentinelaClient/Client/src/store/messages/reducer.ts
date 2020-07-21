import { createReducer } from 'deox';
import * as _ from 'lodash';
import { MessagesActions } from './actions';
import { MessagesState } from './types';

const InitialMessagesState: MessagesState = {
  selected: []
};

const reducer = createReducer(InitialMessagesState, (handleAction) => [
  handleAction(MessagesActions.addMessage, handleAddMessageAction()),
  handleAction(MessagesActions.deleteMessage, handleDeleteMessageAction()),
  handleAction(MessagesActions.resetListMessages, handleResetListAction()),
  handleAction(MessagesActions.addListMessages, handleAddListMessagesAction()),
  handleAction(
    MessagesActions.deleteListMessages,
    handleDeleteListMessagesAction()
  )
]);

function handleAddMessageAction() {
  return (state: MessagesState, action: any) => {

    console.log("Message Length 1: " + state.selected.length);
    _.remove(state.selected, (m:any)=>m.id === action.payload.id)
    const ns = _.concat(state.selected, action.payload);

    return {
      ...state,
      selected: ns
    };
  };
}

function handleDeleteMessageAction() {
  return (state: MessagesState, action: any) => {
    return {
      ...state,
      selected: _.differenceBy(state.selected, [{ id: action.payload }], 'id')
    };
  };
}

function handleResetListAction() {
  return (state: MessagesState, action: any) => {
    return {
      ...state,
      selected: []
    };
  };
}

function handleAddListMessagesAction() {
  return (state: MessagesState, action: any) => {
    const sel = _.uniqBy(_.concat(state.selected, action.payload), 'id');

    return {
      ...state,
      selected: _.uniqBy(_.concat(state.selected, action.payload), 'id')
    };
  };
}

function handleDeleteListMessagesAction() {
  return (state: MessagesState, action: any) => {
    return {
      ...state,
      selected: _.differenceBy(state.selected, action.payload, 'id')
    };
  };
}

export default reducer;
