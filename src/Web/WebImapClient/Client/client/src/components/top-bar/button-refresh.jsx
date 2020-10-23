import React from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import TopBarButton from './top-bar-button';

const ButtonRefresh = ({t, onRefresh}) => (
    <span isotip={t('topBar.refresh')} isotip-position='bottom' isotip-size='small'>
      <TopBarButton onClick={onRefresh}>refresh</TopBarButton>
    </span>
);

ButtonRefresh.propTypes = {
    onRefresh: PropTypes.func.isRequired
};

export default translate()(ButtonRefresh);
