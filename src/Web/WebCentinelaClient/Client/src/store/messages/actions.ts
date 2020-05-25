import { createAction } from 'deox';
import { PREFIX, Message } from './types';

export const MessagesActions = {
  addMessage: createAction(
    `${PREFIX}/ADD_MESSAGE`,
    (resolve: any) => (item: Message) => resolve(item)
  ),
  deleteMessage: createAction(
    `${PREFIX}/DELETE_MESSAGE`,
    (resolve: any) => (id: string) => resolve(id)
  ),
  resetListMessages: createAction(`${PREFIX}/RESET_LIST_MESSAGES`),
  addListMessages: createAction(
    `${PREFIX}/ADD_LIST_MESSAGES`,
    (resolve: any) => (items: Message[]) => resolve(items)
  ),
  deleteListMessages: createAction(
    `${PREFIX}/DELETE_LIST_MESSAGES`,
    (resolve: any) => (ids: string[]) => resolve(ids)
  )
};
