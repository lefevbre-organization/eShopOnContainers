import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '../buttons/icon-button';
import styles from './top-bar-user-button.scss';

const picUser = 'assets/images/icon-user.png';
const TopBarButton = ({onClick, className, children}) => (
  <IconButton
    onClick={onClick}
        className={`${className} ${styles['action-item-custom']}`}>
        {/*{children}*/}
        <img border="0" alt="Lefebvre" src={picUser}></img>
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
