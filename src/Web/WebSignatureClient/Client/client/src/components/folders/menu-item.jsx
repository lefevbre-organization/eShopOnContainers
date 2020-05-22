import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {FolderTypes} from '../../services/folder';
import styles from './menu-item.scss';
import mainCss from '../../styles/main.scss';

class MenuItem extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      className, selected, graphic, label, onClick
    } = this.props;
    return (
      <a className={`${className} ${mainCss['mdc-list-item']} ${styles.listItem}
        ${selected ? mainCss['mdc-list-item--activated'] : ''}`}
        title={label}
        onClick={onClick}
      >
        <span className={`material-icons ${mainCss['mdc-list-item__graphic']} ${styles.graphic}`}>
          {graphic}
        </span>
        <span className={`${mainCss['mdc-list-item__primary-text']} ${styles.primaryText}`}>
          {label}
        </span>
      </a>
    );
  }
}

MenuItem.propTypes = {
  className: PropTypes.string,
  graphic: PropTypes.string,
  label: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  onClick: PropTypes.func
};

MenuItem.defaultProps = {
  className: '',
  graphic: FolderTypes.FOLDER.icon,
  selected: false
  
};

export default MenuItem;
