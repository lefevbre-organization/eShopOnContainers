export const PREFIX = 'MESSAGES';

export interface Message {
  id: string;
  subject: string;
  folder: string;
  sentDateTime: string;
  raw: string;
  attachments?: {
    name: string;
    checked: boolean;
  }[];
}

export interface MessagesState {
  selected: Message[];
}

export type AddMessagePayload = {
  payload: Message;
};

export type DeleteMessagePayload = {
  payload: string;
};

export type AddListMessagesPayload = {
  payload: Message[];
};

export type DeleteListMessagePayload = {
  payload: string[];
};
