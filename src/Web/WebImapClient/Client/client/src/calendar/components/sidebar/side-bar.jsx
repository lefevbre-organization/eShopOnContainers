import React, { Component } from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import FolderContainer from '../../../components/folders/folder-container';
//import { DroppablePayloadTypes } from '../folders/folder-list';
//import IconButton from '../../../components/buttons/icon-button';

import groupBy from "lodash/groupBy";
import sortBy from "lodash/sortBy";
import orderBy from "lodash/orderBy";
import {
    faInbox,
    faEnvelopeSquare,
    faTrashAlt,
    faCalendar,
    faExclamationTriangle,
    faChevronLeft
} from "@fortawesome/free-solid-svg-icons";
import CalendarItem from "./calendaritem/calendaritem";
import { Link } from "react-router-dom";
import { Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CalendarComponent, ChangedEventArgs } from '@syncfusion/ej2-react-calendars';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import IconButton from '../../../components/buttons/icon-button';

//import { moveFolder } from '../../services/folder';
import mainCss from '../../../styles/main.scss';
import styles from './side-bar.scss';
//import { editNewMessage } from '../../services/application';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import randomColor from 'randomcolor';

import {
    listCalendarList
    
} from '../../api/calendar-api';



class SideBar extends Component {
  constructor(props) {
      super(props);

      this.state = {
          calendars: [],         
      };

      listCalendarList()
          .then(result => {
                this.setState(                    
                    { calendars: result }
                )
            })
            .catch(error => {
                console.log('error ->', error);
       });   

    } 

    calendarChange(args) {
        this.props.onCalendarChange(args);
    }

    newEventClick() {
        this.props.onCalendarOpenEditor();
    }

    newCalendarClick() {
        this.props.onCalendarOpenCalnendarView();
    }

    navigateToList(evt, calendarId, checked) {
        const calendar = this.props.calendarResult.calendars.find(el => el.id === calendarId);
        this.props.onCalendarClick(calendar.id, checked);
    }

    sidebarAction() {
        this.props.onSidebarCloseClick(this.state.leftSideBarOpen);
        //  this.setState({ sideBarCollapsed:true })
    }

  render() {
    const { t, collapsed } = this.props; 
    return (
      <aside
        className={`${styles['side-bar']}
          ${mainCss['mdc-drawer']}
          ${mainCss['mdc-drawer--dismissible']}
          ${SideBar.getCollapsedClassName(collapsed)}
          `}>
        <div
          className={`${mainCss['mdc-drawer__header']} ${styles['top-container']} ${styles['divheader']}`}>
          {/*{(location.protocol !== 'https:' &&
            <span className='material-icons' isotip={t('sideBar.errors.noSSL')}
              isotip-position='bottom-start' isotip-size='small'>
            lock_open
            </span>)}*/}
          {this.props.errors.diskQuotaExceeded && (
            <span
              className='material-icons'
              isotip={t('sideBar.errors.diskQuotaExceeded')}
              isotip-position='bottom-start'
              isotip-size='small'>
              disc_full
            </span>
          )}
          {/* <img className={styles.logo} border="0" alt="Lefebvre" src="assets/images/logo-elderecho.png"></img>*/}
          <button
            style={{ height: 48 }}
            className={`${mainCss['mdc-button']}
                    ${mainCss['mdc-button']} ${styles['compose']}`}
                    //onClick={this.handleOnNewMessage}
                >
            {/* <i className='material-icons mdc-button__icon' style={{ fontSize: 48 }}>add_circle_outline</i>*/}
            <img
              className={styles.plusbuttton}
              border='0'
              src='assets/images/plus.png'></img>
            <span className='mdc-button__label' style={{ fontSize: 10.6 }}>
              {t('calendar-sidebar.newevent')}
            </span>
          </button>
          <span
            className={styles.toggle}
            isotip={t('sideBar.hide')}
            isotip-position='bottom-end'
            isotip-size='small'>
            <IconButton onClick={this.props.sideBarToggle}>
              keyboard_arrow_left
            </IconButton>
          </span>
        </div>
            <PerfectScrollbar>
                <div className='calendar-control-section' style={{ overflow: 'auto' }, { innerWidth: '40%' }, { Height: '40%' }}>
                    <CalendarComponent change={this.calendarChange.bind(this)} ></CalendarComponent>
                </div> 

                <div className={`${styles['calendartitle']}`}>
                    <span className={`${styles['name']}`} >  {t('calendar-sidebar.mycalendars')}</span>
                    <span className={`${styles['button']}`}>
                        <IconButton
                            className={`${styles.addButton}`} onClick={this.newCalendarClick}>
                            add_circle_outline
                         </IconButton>                       
                    </span>                   
                </div>

                {/* {this.state.calendars.map((c) => (
                    <div className={`${styles['calendaritem']}`}>{c.name}</div>


                ))} */}

               

                {this.state.calendars.map(el => {

                    const color = randomColor.randomColor();

                    const iconProps = {
                        icon: faCalendar,
                        color: "#001978",
                        size: "lg"
                    };

                    return (
                        <CalendarItem
                            key={el.href + "_label"}
                            onClick={this.navigateToList}
                            name={el.name}
                            id={el.href}
                            color={color}
                            accessRole={'owner'}
                            iconProps={iconProps}
                            selected={el.selected}
                            primary={true}
                            onCalendarOpenCalnendarView={this.props.onCalendarOpenCalnendarView}
                            onCalendarDelete={this.props.onCalendarDelete}
                            onCalendarColorModify={this.props.onCalendarColorModify}
                        />
                    );
                })}


        </PerfectScrollbar>
      </aside>
    );
    }

  static getCollapsedClassName(collapsed) {
    return collapsed ? '' : `${styles.open} ${mainCss['mdc-drawer--open']}`;
  }
}


SideBar.propTypes = {
  t: PropTypes.func.isRequired,
  sideBarToggle: PropTypes.func.isRequired,
  collapsed: PropTypes.bool.isRequired,
  application: PropTypes.object,
  errors: PropTypes.object,
  newMessage: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  application: state.application,
  errors: state.application.errors,
  lexon: state.lexon,
});

const mapDispatchToProps = (dispatch) => ({
  //moveFolderToFirstLevel: (user, folder) =>
  //  moveFolder(dispatch, user, folder, null),
  //newMessage: (sign) => editNewMessage(dispatch, [], sign),
});

const mergeProps = (stateProps, dispatchProps, ownProps) =>
  Object.assign({}, stateProps, dispatchProps, ownProps, {
    moveFolderToFirstLevel: (folder) =>
      dispatchProps.moveFolderToFirstLevel(stateProps.application.user, folder),
  });

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(translate()(SideBar));
