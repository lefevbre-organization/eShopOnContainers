import React from 'react';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import {setMessageFilterKey} from '../../actions/application';
import MessageFilters, {getFromKey} from '../../services/message-filters';
import styles from './filter-dialog.scss';
import mainCss from '../../styles/main.scss';

export const FilterDialog = ({t, visible, activeMessageFilter, setMessageFilter}) =>
  <div
    className={`${styles['filter-dialog']} ${mainCss['mdc-menu']} ${mainCss['mdc-menu-surface']}
    ${visible ? mainCss['mdc-menu-surface--open'] : ''}`}
    aria-hidden={!visible}
  >
    <ul className={`${mainCss['mdc-list']} ${mainCss['mdc-list--dense']}`} >
            <li
                key='1'
                className={`${styles['filter-dialog__item']} ${mainCss['mdc-list-item']}`}
                onClick={() => setMessageFilter(value)}
            >
                <i className={`${styles.check} ${styles['check--active']} material-icons`}>
                    mail
            </i>
                Mail
            </li>    
    
            <li
                key='2'
                className={`${styles['filter-dialog__item']} ${mainCss['mdc-list-item']}`}
                onClick={() => setMessageFilter(value)}
            >
                <i className={`${styles.check} ${styles['check--active']} material-icons`}>
                    event
            </i>
                Calendar
            </li>  
   
            <li
                key='3'
                className={`${styles['filter-dialog__item']} ${mainCss['mdc-list-item']}`}
                onClick={() => setMessageFilter(value)}
            >
                <i className={`${styles.check} ${styles['check--active']} material-icons`}>
                    folder
            </i>
                File manager
            </li>

            <li
                key='4'
                className={`${styles['filter-dialog__item']} ${mainCss['mdc-list-item']}`}
                onClick={() => setMessageFilter(value)}
            >
                <i className={`${styles.check} ${styles['check--active']} material-icons`}>
                    home
            </i>
                Return Lex-on
            </li>
    </ul>
  </div>;

const mapStateToProps = state => ({
  activeMessageFilter: getFromKey(state.application.messageFilterKey)
});

const mapDispatchToProps = dispatch => ({
  setMessageFilter: messageFilter => dispatch(setMessageFilterKey(messageFilter.key))
});

export default connect(mapStateToProps, mapDispatchToProps)(translate()(FilterDialog));
