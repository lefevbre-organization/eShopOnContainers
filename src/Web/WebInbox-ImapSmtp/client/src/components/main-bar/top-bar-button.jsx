import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '../buttons/icon-button';
import styles from './top-bar-button.scss';

const picProducts = 'assets/images/icon-products.png';
const TopBarButton = ({onClick, className, children}) => (
  <IconButton
    onClick={onClick}
        className={`${className} ${styles['action-item-custom']}`}>
        {/*{children}*/}
        <img border="0" alt="Lefebvre" src={picProducts}></img>
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
