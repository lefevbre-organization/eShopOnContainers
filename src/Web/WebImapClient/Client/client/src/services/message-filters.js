import {connect} from 'react-redux';

const getAll = messages => messages;
const getRead = messages => messages.filter(message => message.seen === true);
const getUnread = messages => messages.filter(message => message.seen === false);
const getFlagged = messages => messages.filter(message => message.flagged === true);
const getUserSearch = (messages, searchTerm) => messages.filter(message => {
  if (message && message.subject && message.from && message.from.length){
    return (
      message.subject.toUpperCase().indexOf(searchTerm.toUpperCase()) !== -1 || 
      message.from[0].toUpperCase().indexOf(searchTerm.toUpperCase()) !== -1
    )
  }
});

const MessageFilters = [
  {key: 'ALL', i18nKey: 'messageList.filters.All', selector: getAll},
  {key: 'READ', i18nKey: 'messageList.filters.Read', selector: getRead},
  {key: 'UNREAD', i18nKey: 'messageList.filters.Unread', selector: getUnread},
  {key: 'FLAGGED', i18nKey: 'messageList.filters.Flagged', selector: getFlagged},
  {key: 'USER_SEARCH', i18nKey: 'User_Search', selector: getUserSearch}
].reduce((acc, mf) => {
  acc[mf.key] = mf;
  return acc;
}, {});

export const getFromKey = (key = null) => {
  if (key && MessageFilters[key]) {
    return MessageFilters[key];
  }
  return MessageFilters.ALL;
};

export default MessageFilters;