import React from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import TopBarButton from './top-bar-button';

export const ButtonReply = ({t, outboxEmpty, replyMessage}) => (
  outboxEmpty && (
    <span isotip={t('topBar.reply')} isotip-position='bottom' isotip-size='small'>
      <TopBarButton onClick={replyMessage}>reply</TopBarButton>
    </span>)
);

ButtonReply.propTypes = {
  outboxEmpty: PropTypes.bool.isRequired,
  replyMessage: PropTypes.func.isRequired
};

export default translate()(ButtonReply);
