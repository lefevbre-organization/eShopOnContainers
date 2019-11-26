import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '../buttons/icon-button';
import styles from './top-bar-button.scss';
import mainCss from '../../styles/main.scss';

const TopBarButton = ({onClick, className, children}) => (
  <IconButton
    onClick={onClick}
        className={`${className} ${styles['action-item-custom']}`}>
    {children}
  </IconButton>
);

TopBarButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string
};

TopBarButton.defaultProps = {
  className: ''
};

export default TopBarButton;
