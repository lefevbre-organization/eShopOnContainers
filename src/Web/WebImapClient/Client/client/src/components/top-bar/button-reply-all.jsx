import React from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import TopBarButton from './top-bar-button';

export const ButtonReplyAll = ({t, outboxEmpty, replyMessage}) => (
  outboxEmpty && (
    <span isotip={t('topBar.replyAll')} isotip-position='bottom' isotip-size='small'>
      <TopBarButton onClick={replyMessage}>reply_all</TopBarButton>
    </span>)
);

ButtonReplyAll.propTypes = {
  outboxEmpty: PropTypes.bool.isRequired,
  replyMessage: PropTypes.func.isRequired
};

export default translate()(ButtonReplyAll);
