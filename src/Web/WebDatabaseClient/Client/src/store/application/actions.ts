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
  )
};
