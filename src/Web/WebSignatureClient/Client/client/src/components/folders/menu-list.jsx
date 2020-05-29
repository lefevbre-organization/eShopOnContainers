import React, {Component} from 'react';
import {connect} from 'react-redux';
import MenuItem from './menu-item';
import {selectFolder} from '../../actions/application';
import { setSignaturesFilterKey, selectSignature } from '../../actions/application';

import {clearSelected} from '../../actions/messages';
import {clearSelectedMessage} from '../../services/application';
import {resetFolderMessagesCache} from '../../services/message';
import {getSelectedFolder} from '../../selectors/folders';
import styles from './menu-list.scss';
import mainCss from '../../styles/main.scss';

export const DroppablePayloadTypes = {
  FOLDER: 'FOLDER',
  MESSAGES: 'MESSAGES'
};

export class MenuListClass extends Component {
  render() {
    const selectedFilter = this.props.application.signaturesFilterKey;
    const option1 = 'En progreso';
    const option2 = 'Completadas';
    const option3 = 'Mostrar todas';

    return (
        <div key={'firmas'} className={`${styles.itemContainer}`}>
          <MenuItem
            label={'Firmas'} 
            graphic={'input'}
            className={styles.item}
            selected={true}
            />
            <nav className={`${mainCss['mdc-list']} ${styles.childList}`}>
              <MenuItem label={option1} graphic={'stop'} selected = {option1 === selectedFilter} onClick={event => this.onClick(event, option1)}/>
              <MenuItem label={option2} graphic={'stop'} selected = {option2 === selectedFilter} onClick={event => this.onClick(event, option2)}/>
              <MenuItem label={option3} graphic={'stop'} selected = {option3 === selectedFilter} onClick={event => this.onClick(event, option3)}/>
            </nav>   
        </div>
    );
  }

  onClick(event, key) {
    event.stopPropagation();
    this.props.setSignaturesFilterKey(key);
    this.props.signatureClicked(null);
  }
}


const mapStateToProps = state => ({
  application: state.application,
  selectedFolder: getSelectedFolder(state) || {},
  foldersState: state.folders,
  messages: state.messages
});

const mapDispatchToProps = dispatch => ({
  selectFolder: (folder, user) => {
    dispatch(selectFolder(folder));
    clearSelectedMessage(dispatch);
    dispatch(clearSelected());
    resetFolderMessagesCache(dispatch, user, folder);
  },
  setSignaturesFilterKey: (key) => dispatch(setSignaturesFilterKey(key)),
  signatureClicked: signature => dispatch(selectSignature(signature))
});

const mergeProps = (stateProps, dispatchProps, ownProps) => (Object.assign({}, stateProps, dispatchProps, ownProps, {
  selectFolder: folder =>
    dispatchProps.selectFolder(folder, stateProps.application.user),
  setSignaturesFilterKey: key => dispatchProps.setSignaturesFilterKey(key),
  signatureClicked: signature => dispatchProps.signatureClicked(signature)
}));

const MenuList = connect(mapStateToProps, mapDispatchToProps, mergeProps)(MenuListClass);
export default MenuList;