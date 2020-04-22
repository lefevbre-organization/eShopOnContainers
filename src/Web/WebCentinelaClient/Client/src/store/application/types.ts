//import { addError, removeErrors } from './actions';
export const PREFIX = 'APPLICATION';

export interface ApplicationState {
  errors: string[];
  config: any;
  isLoading: boolean;
  user: any;
  showArchiveModal: boolean;
}

export type AddErrorPayload = {
  payload: string;
};

export type SetLoadingStatusPayload = {
  payload: boolean;
};
