import { createAction } from 'deox';
import { PREFIX } from './types';

export const ApplicationActions = {
  addError: createAction(
    `${PREFIX}/ADD_ERROR`,
    (resolve: any) => (item: string) => resolve(item)
  ),
  removeError: createAction(`${PREFIX}/REMOVE_ERRORS`),
  setLoadingStatus: createAction(
    `${PREFIX}/SET_LOADING_STATUS`,
    (resolve: any) => (status: boolean) => resolve(status)
  ),
  setCurrentUser: createAction(
    `${PREFIX}/SET_CURRENT_USER`,
    (resolve: any) => (user: string) => resolve(user)
  ),
  toggleArchiveModal: createAction(`${PREFIX}/TOGGLE_MODAL_ARCHIVE_DOCUMENTS`)
};
