import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {FolderTypes} from '../../services/folder';
import styles from './folder-item.scss';
import mainCss from '../../styles/main.scss';

class FolderItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dragOver: false,
      contextMenuVisible: false
    };
    this.handleOnDragStart = this.onDragStart.bind(this);
    this.handleOnDragOver = this.onDragOver.bind(this);
    this.handleOnDragLeave = this.onDragLeave.bind(this);
    this.handleOnDrop = this.onDrop.bind(this);
  }

  render() {
    const {
      className, selected, draggable, graphic, label, newMessageCount, unreadMessageCount, onClick,
      onRename, onAddChild, onDelete
    } = this.props;
    const {dragOver} = this.state;
    const labelWithCount = `${label} ${unreadMessageCount > 0 ? `(${unreadMessageCount})` : ''}`;
    const hasContextMenu = onDelete !== null || onAddChild !== null || onRename !== null;
    const conditionalDraggableAttributes = {};
    if (draggable) {
      conditionalDraggableAttributes.draggable = true;
      // Support for MS Edge DnD requires link to have a href attribute
      conditionalDraggableAttributes.href = '#';
      conditionalDraggableAttributes.onDragStart = this.handleOnDragStart;
    }
    return (
      <a className={`${className} ${mainCss['mdc-list-item']} ${styles.listItem}
        ${selected ? mainCss['mdc-list-item--activated'] : ''}
        ${dragOver ? mainCss['mdc-list-item--selected'] : ''}`}
      title={labelWithCount}
      onClick={onClick}
      {...conditionalDraggableAttributes}
      onDrop={this.handleOnDrop} onDragOver={this.handleOnDragOver} onDragLeave={this.handleOnDragLeave}
      onMouseLeave={event => this.hideContextMenu(event)}
      >
        <span className={`material-icons ${mainCss['mdc-list-item__graphic']} ${styles.graphic}`}>
          <i className={this.getIcon(graphic)} style={{fontSize: 20, color: '#001978'}}></i>
        </span>

        <span className={`${mainCss['mdc-list-item__primary-text']} ${styles.primaryText}
          ${newMessageCount > 0 ? styles.hasNewMessages : ''}`}>
          {labelWithCount}
        </span>
        <span className={styles.actions}>
          <span className={`${styles.contextMenu} ${this.state.contextMenuVisible ? styles.visible : ''}`} style={{marginRight: 5}}>
            {onDelete !== null && <i className={'lf-icon-trash'} style={{fontSize: 20, marginRight: 5}} onClick={onDelete}></i>}
            {onAddChild !== null && <i className={'lf-icon-folder-new'} style={{fontSize: 20, marginRight: 5}} onClick={onAddChild}></i>}
            {onRename !== null && <i className={'lf-icon-pencil'} style={{fontSize: 20, marginRight: 5}} onClick={onRename}></i>}
          </span>
          {hasContextMenu && !this.state.contextMenuVisible
            && <i className={'material-icons'} style={{marginRight: 5}} onClick={event => this.showContextMenu(event)}>more_vert</i>}
        </span>
      </a>
    );
  }

  onDragStart(event) {
    event.stopPropagation();
    this.props.onDragStart(event);
  }

  onDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    this.setState({dragOver: false});
    this.props.onDrop(event);
  }

  onDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.types && Array.from(event.dataTransfer.types).includes('application/json')) {
      this.setState({dragOver: true});
    }
  }

  onDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    this.setState({dragOver: false});
  }

  showContextMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    this.setState({contextMenuVisible: true});
  }

  hideContextMenu() {
    this.setState({contextMenuVisible: false});
  }

  getIcon(graphic) {
    switch(graphic) {
      case "move_to_inbox":
        return "lf-icon-inbox";
      case "delete_outline":
        return "lf-icon-trash";
      case "border_color":
        return "lf-icon-document";
      case "send":
        return "lf-icon-send";
      default:
        return "lf-icon-folder";
    }
  }
}

FolderItem.propTypes = {
  className: PropTypes.string,
  graphic: PropTypes.string,
  label: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  draggable: PropTypes.bool,
  onDragStart: PropTypes.func,
  onDrop: PropTypes.func,
  onClick: PropTypes.func,
  onRename: PropTypes.func,
  onAddChild: PropTypes.func,
  onDelete: PropTypes.func,
  unreadMessageCount: PropTypes.number,
  newMessageCount: PropTypes.number
};

FolderItem.defaultProps = {
  className: '',
  graphic: FolderTypes.FOLDER.icon,
  selected: false,
  draggable: false,
  unreadMessageCount: 0,
  newMessageCount: 0,
  onDragStart: () => {},
  onDrop: null,
  onRename: null,
  onAddChild: null,
  onDelete: null
};

export default FolderItem;
