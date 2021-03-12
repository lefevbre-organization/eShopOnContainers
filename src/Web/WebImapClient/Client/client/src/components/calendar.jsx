/* eslint-disable indent */
import React, { Component} from 'react';
import ReactDOM from "react-dom";
import { connect } from 'react-redux';
import history from '../routes/history';
import Spinner from './spinner/spinner';
import MainBar from './main-bar/main-bar';
import SideBar from '../calendar/components/sidebar/side-bar';
import {clearUserCredentials} from '../actions/application';
import {
 setGUID,
 setSign,
 setDataBase,
 resetIdActuation,
 resetIdEvent

} from '../actions/lexon';
import styles from './app.scss';
import { translate } from 'react-i18next';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import {
    ScheduleComponent, ViewsDirective, ViewDirective,
    Day, Week, WorkWeek, Month, Agenda, Inject, Resize, DragAndDrop, ResourcesDirective, ResourceDirective
} from '@syncfusion/ej2-react-schedule';

import { DataManager, Query, Predicate } from '@syncfusion/ej2-data';
import { ToastComponent } from '@syncfusion/ej2-react-notifications';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { DropDownList } from '@syncfusion/ej2-dropdowns';
import { setCulture, L10n, loadCldr, Internationalization, compile } from '@syncfusion/ej2-base';
import currencies from 'cldr-data/main/es/currencies.json';
import gregorian from 'cldr-data/main/es/ca-gregorian.json';
import numbers from 'cldr-data/main/es/numbers.json';
import timeZoneNames from 'cldr-data/main/es/timeZoneNames.json';
import numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import weekData from 'cldr-data/supplemental/weekData.json';// To load the culture based first day of week
import moment from 'moment';
import groupBy from "lodash/groupBy";
import orderBy from "lodash/orderBy";
import { createElement } from '@syncfusion/ej2-base';
import { TabComponent } from '@syncfusion/ej2-react-navigations';
import "@pathofdev/react-tag-input/build/index.css";
import {
    addCalendarEvent,
    getEventList,
    deleteCalendar,
    listCalendarList,
    deleteCalendarEvent,
    updateCalendarList,
    createCalendarUser
} from '../calendar/api/calendar-api';

import Reminder from "../calendar/components/main/reminder/reminder";
import { Popup } from '@syncfusion/ej2-popups';
import { Eventtype } from '../calendar/components/eventtypes/eventtype';
import { getEventTypes } from '../services/accounts';
import { Calendars } from '../calendar/components/calendars/calendars';
import AttendeeAddress from '../calendar/components/main/attendee/attendee-address';
import './lefebvre-material.css';
import {getCalendars, selectCalendar} from "../calendar/components/sidebar/sidebar.actions";
import {bindActionCreators} from "redux";
import {Redirect} from "react-router-dom";
import LexonComponentCalendar from "../apps/lexon_content_calendar";
import {
    addEventToActuation,
    createAppoinment
} from "../calendar/api/lexon";

class Calendar extends Component {
  constructor(props) {
    super(props);

    this.localEvents = [];
    this.loading = false;

    this.state = {
        redirectToLogin: this.props.lexon.user ? false : true,
        sidebarOpen: false,
        sidebarDocked: false,
        leftSideBar: {
            collapsed: false
        },
        hidePromptDialog: false,
        hidePromptEventTypeDialog: false,
        showPromptImportContactsDialog: false,
        calendarToEdit: undefined,
        reminders: [],
        eventType: undefined,
        isVisibility: false,
        calendars: [],
        schedule: null,
        to2: [],
        idActuation: '',
        idEvent: '',
        isUpdatedDefaultAccount: false
      };

      if (!this.props.lexon.user) {
          this.props.logout();
      }

      const { t } = this.props;

      this.toggleSideBar = this.toggleSideBar.bind(this);
      this.dataManager = new DataManager();
      this.defaultCalendar = undefined;
      this.scheduleData = [];
      this.position = { X: 'Center', Y: 'Bottom' };
      this.resourceCalendarData = [];
      this.toasts = [
          { content: t("schedule.toast-processing"), cssClass: 'e-toast-black', icon: '' },
          { content: t("schedule.toast-process-complete"), cssClass: 'e-toast-black', icon: '' },
          { content: t("schedule.toast-process-error"), cssClass: 'e-toast-danger', icon: 'e-error toast-icons' }
      ];
      this.instance = new Internationalization();
      this.tabInstance = new TabComponent();
      this.layoutIframe = false;
      this.layoutIframeNewEventView = false;
      this.layoutIframeEditEventView = false;
      this.openCalendarView = this.openCalendarView.bind(this);
      this.deleteCalendar = this.deleteCalendar.bind(this);
      this.calendarColorModify = this.calendarColorModify.bind(this);
      this.onEventRendered = this.onEventRendered.bind(this);
      this.buildEventoCalDav = this.buildEventoCalDav.bind(this);
      this.handleAddAddress = this.addAddress.bind(this);
      this.handleRemoveAddress = this.removeAddress.bind(this);
      this.onCloseDialog = this.onCloseDialog.bind(this);
      this.onExportEvents = this.onExportEvents.bind(this);
      this.loadCalendarEvents = this.loadCalendarEvents.bind(this);
      this.handleClassificatedEvent = this.handleClassificatedEvent.bind(this);
      this.handleClassificatedEventRemoved = this.handleClassificatedEventRemoved.bind(this);
      this.classifyEventOnLexon = this.classifyEventOnLexon.bind(this);

      this.handleGetUserFromLexonConnector = this.handleGetUserFromLexonConnector.bind(
          this
      );

      this.alertButtons = [{
          // Click the footer buttons to hide the Dialog
          click: () => {
              this.setState({ hideAlertDialog: false });
          },
          buttonModel: { content: 'Dismiss', isPrimary: true }
      }];
      // Calednar View Dialog
      this.confirmButton = [{
          click: () => {
              this.setState({ hideConfirmDialog: false });
          },
          buttonModel: { content: 'Yes', isPrimary: true }
      },
      {
          click: () => {
              this.setState({ hideConfirmDialog: false });
          },
          buttonModel: { content: 'No' }
      }];
      // Calednar View Dialog
      this.promptButtons = [{
          click: () => {
              this.setState({ hidePromptDialog: false });
          },
          buttonModel: { content: 'Accept', isPrimary: true }
      },
      {
          click: () => {
              this.setState({ hidePromptDialog: false });
          },
          buttonModel: { content: 'Cancel' }
      }];
      // Calednar View Dialog
      this.animationSettings = { effect: 'None' };

      // Syncfusion omponent translation
      this.setGlobalization();
      this.tabObj = undefined;
      this.drowDownListEventType = undefined;
      this.drowDownListVisibility = undefined;
      this.selectedEvent = undefined;

      // to change when api would be ready
      this.eventTypeDataSource = [];

      this.items = [
          {
              text: 'Dashboard',
              iconCss: 'e-ddb-icons e-dashboard'
          },
          {
              text: 'Notifications',
              iconCss: 'e-ddb-icons e-notifications'
          },
          {
              text: 'User Settings',
              iconCss: 'e-ddb-icons e-settings'
          },
          {
              text: 'Log Out',
              iconCss: 'e-ddb-icons e-logout'
          }
      ];

      this.TokensFlows();
    }


  hasProduct(product) {
    if (this.props.currentUser && this.props.currentUser.roles) {
      return this.props.currentUser.roles.indexOf(product) > -1;
    }
    return false;
  }


    toggleSideBar() {
        const toggleCollapsed = !this.state.leftSideBar.collapsed;
        this.setState({
            leftSideBar: {
                collapsed: toggleCollapsed
            }
        });
    }

  render() {
        const { t, lexon, email } = this.props;
        const { leftSideBar, calendars } = this.state;

        if (this.state.redirectToLogin) {
            return <Redirect to={"/login"}/>;
        }
      return (

             <div
                className='custom-padding-top'>

              {!this.layoutIframe ? (
                  <div >
                      <MainBar
                          sideBarCollapsed={false}
                          sideBarToggle={this.toggleSideBar}
                          hiddeSearch={true}
                      />
                  </div>
              ) : (
                      <div>
                          <style jsx>{`
                                         .e-content-wrap {
                                             height:100% !important;
                                            }                            
                                    `}</style>

                      </div>
              )}

              <div id='mainnav-app' />
              <div id='target' className={styles.app}>
                  <Spinner
                    visible={
                        this.layoutIframeNewEventView ||
                        this.layoutIframeEditEventView
                    }
                    className={styles.spinnerCalendar}
                    pathClassName={styles.spinnerPath}
                  />
                  <SideBar
                      collapsed={leftSideBar.collapsed}
                      sideBarToggle={this.toggleSideBar}
                      casefile={lexon.idCaseFile}
                      bbdd={lexon.bbdd}
                      sideBarCollapsed={false}
                      sideBarToggle={this.toggleSideBar}
                      getCalendarList={this.sidebarCalendarList}
                      pathname={this.props.location.pathname}
                      calendarResult={this.props.calendarsResult}
                      onCalendarClick={this.loadCalendarEvents.bind(this)}
                      onSidebarCloseClick={this.handleShowLeftSidebarClick}
                      onCalendarChange={this.handleScheduleDate}
                      onCalendarOpenEditor={this.handleScheduleOpenNewEventEditor}
                      onCalendarOpenCalnendarView={this.openCalendarView}
                      onCalendarDelete={this.deleteCalendar}
                      onCalendarColorModify={this.calendarColorModify}
                      isIframeContainer={this.layoutIframe}
                      ref={sidebar => this.sidebarCalendarObj = sidebar}
                      calendars={calendars}
                  />

                  <div
                      className={`${styles['content-wrapper']}
                                ${leftSideBar.collapsed
                              ? ''
                              : styles['with-side-bar']
                          } ${styles['custom-padding-top']}`}>

                      <div className='schedule-control-section'>
                          <div className='control-section'>
                              <div className={`
                                ${!this.layoutIframeNewEventView
                                      ? ''
                                      : styles.hidden
                                  } `}>
                                <ScheduleComponent
                                      id="schedule"
                                      cssClass='schedule-header-bar'
                                      ref={schedule => this.scheduleObj = schedule}
                                      width='100%'
                                      currentView="Month"
                                      allowKeyboardInteraction={true}
                                      height='650px'
                                      views={this.viewsCollections}
                                      actionComplete={this.onEventRendered.bind(this)}
                                      popupOpen={this.onPopupOpen.bind(this)}
                                      actionBegin={this.onActionBegin.bind(this)}
                                      cellDoubleClick={this.doubleOpen.bind(this)}
                                      dataBound={()=>{console.log("DataBound")}}
                                      eventSettings={
                                          {
                                              dataSource: this.scheduleData,
                                              fields: {
                                                  subject: { name: 'Subject', validation: { required: true } }
                                              }
                                          }

                                      }
                                      dragStart={(this.onEventDragStart.bind(this))}
                                      eventClick={(this.onEventClick.bind(this))}
                                      dragStop={(this.onEventDragStop.bind(this))}>
                                      <ViewsDirective>
                                          <ViewDirective option='Day' eventTemplate={this.eventTemplate.bind(this)} />
                                          <ViewDirective option='Week' eventTemplate={this.eventTemplate.bind(this)} />
                                          <ViewDirective option='WorkWeek' eventTemplate={this.eventTemplate.bind(this)} />
                                          <ViewDirective option='Month' eventTemplate={this.eventTemplate.bind(this)} />
                                          <ViewDirective option='Agenda' eventTemplate={this.eventTemplateAgendaView.bind(this)} />
                                      </ViewsDirective>
                                       <ResourcesDirective>
                                          {/*<ResourceDirective field='eventType' title={t("schedule.eventtype")} name='eventType' allowMultiple={false} dataSource={this.eventTypeDataSource} textField='text' idField='id' colorField='backgroundColor' />  */}
                                          <ResourceDirective ref={this.calendarObj} field='CalendarId' title={t("calendar-sidebar.mycalendars")} name='Calendars' allowMultiple={false} dataSource={this.resourceCalendarData} textField='summary' idField='id' colorField='backgroundColor' />
                                      </ResourcesDirective>
                                      <Inject services={[Day, Week, WorkWeek, Month, Agenda, Resize, DragAndDrop]} />
                                  </ScheduleComponent>
                              </div >
                          </div >
                      </div >
                  </div>
              </div>

                 <section className='main hbox space-between'>

                    <article className='d-flex flex-column position-relative'>
                          <div className="hidden">
                             <AttendeeAddress
                                id='to'
                                addresses={this.state.to2}
                                onAddressAdd={this.handleAddAddress}
                                onAddressRemove={this.handleRemoveAddress}
                                onAddressMove={this.handleMoveAddress}
                                getAddresses={this.props.getAddresses}
                                label={t('compose-message.to')}
                                ref={tag => this.tagObjHead = tag}
                            />
                        </div>

                        <div className="hidden">
                          <Reminder
                                reminders={this.state.reminders}
                                ref={rem => this.remObj = rem}
                            />
                        </div>

                         <div className="hidden">
                            <div className='buttons-wrapper' ref={but => this.buttonEventTypeObj = but}>
                                <ButtonComponent
                                    cssClass='e-flat e-primary'
                                    onClick={this.onEventTypeClick.bind(this)}
                                >Tipos de eventos</ButtonComponent>
                                <ButtonComponent
                                    cssClass='e-flat e-primary'
                                    onClick={this.onImportContactsTypeClick.bind(this)}
                                >Importar eventos</ButtonComponent>
                            </div>
                        </div>

                         <ToastComponent ref={toast => {
                                this.toastObj = toast;
                            }}
                            id='toast_pos'
                            content='Action successfully completed.'
                            position={this.position}
                            target={this.target}
                            close={this.toastOnclose.bind(this)}
                            beforeOpen={this.toastOnbeforeOpen.bind(this)}
                            animation={this.toastCusAnimation}
                            timeOut={2000}
                        >
                        </ToastComponent>
                       <DialogComponent
                            id='dialogDraggable'
                            isModal={true}
                            header={t("calendar.title")}
                            visible={this.state.hidePromptDialog}
                            showCloseIcon={true}
                            animationSettings={this.animationSettings}
                            width='575px'
                            ref={dialog => this.promptDialogInstance = dialog}
                            target='#target'
                            open={this.dialogOpen.bind(this)}
                            close={this.dialogClose.bind(this)}>
                            <div>{(this.state.hidePromptDialog) ? <Calendars
                                userId={this.props.lexon.userId}
                                calendarId={this.state.calendarToEdit}
                                calendars={calendars}
                                close={this.dialogClose.bind(this)}
                            /> : ''}</div>
                      </DialogComponent>
                        <DialogComponent
                            id='eventTypes'
                            isModal={true}
                            header={t("eventtype.title")}
                            visible={this.state.hidePromptEventTypeDialog}
                            showCloseIcon={true}
                            animationSettings={this.animationSettings}
                            width='575px'
                            ref={dialog => this.promptDialogEventTypeInstance = dialog}
                            target='#target'
                            open={this.dialogOpen.bind(this)}
                            close={this.dialogEventTypeClose.bind(this)}>
                            <div>{(this.state.hidePromptEventTypeDialog) ? <Eventtype
                                getlistEventTypes={this.getlistEventTypes.bind(this)}
                                email={this.props.email}
                                close={this.dialogClose.bind(this)}
                            /> : ''}</div>
                        </DialogComponent>

                    </article >
                </section >

             </div >


    );
  }

  toggleSideBar() {
    const toggleCollapsed = !this.state.leftSideBar.collapsed;
    this.setState({
      sideBar: {
        collapsed: toggleCollapsed
      }
    });
  }

    onCloseDialog() {
        this.loadCalendarList(false);
        const buttons = document.getElementsByClassName("e-footer-content");
        if (buttons) {
            for (let i = 0; i < buttons.length; i++) {
                buttons[i].style.visibility = 'visible';
            }
        }

        if (window != window.top) {
            window.top.postMessage(
                JSON.stringify({
                    idEvent: undefined,
                    actionCancelled: true,
                    selectedDate: undefined
                }),
                window.URL_LEXON
            );
        }
    }

    async handleClassificatedEvent(event) {
        const caldavEvent = this.buildEventoCalDav(event.detail);
        const resp = await addCalendarEvent(event.detail.CalendarId, caldavEvent, this.props.lexon.userId);
        this.currentClassification = event.detail.LexonClassification;

        const evt = this.scheduleObj.dataModule.dataManager.dataSource.json.find(e => e.Id.endsWith(event.detail.Id));
        console.log(evt);
        evt.LexonClassification = event.detail.LexonClassification;
        console.log("Refreshing Data 1");
        this.scheduleObj.refresh();
    }

    async handleClassificatedEventRemoved(event) {
        event.detail.LexonClassification = undefined;
        const googleEvent = this.buildEventoCalDav(event.detail);
        const resp = await addCalendarEvent(event.detail.CalendarId, googleEvent, this.props.lexon.userId);
        this.currentClassification = undefined;
    }

    async setGlobalization() {
        if (window.navigator.language.includes("es-")
            || (window.navigator.language === "es")
            || (window.navigator.language === "ca")
            || (window.navigator.language === "ga")
            || (window.navigator.language === "eu")) {
            loadCldr(currencies, numberingSystems, gregorian, numbers, timeZoneNames, weekData);
            const data = await import('../calendar/syncfusion-resources/calendar-es.json');
            setCulture('es');
            L10n.load(data);
        }
    }

    TokensFlows() {
        if (window != window.top) {
            this.layoutIframe = true;
        }


        if (this.props.lexon.idActuation && this.props.lexon.idEvent) {
            this.layoutIframeEditEventView = true;
            this.setState({
                idActuation: this.props.lexon.idActuation,
                idEvent: this.props.lexon.idEvent
            });
        } else if (this.props.lexon.idActuation && !this.props.lexon.idEvent) {
            this.setState({
                idActuation: this.props.lexon.idActuation
            });
            this.layoutIframeNewEventView = true;
        }

        this.props.resetIdActuation();
        this.props.resetIdEvent();
    }

    convertUnicode(input) {
        return input.replace(/\\u(\w{4,4})/g, (a, b) => {
            const charcode = parseInt(b, 16);
            return String.fromCharCode(charcode);
        });
    }

    calendarColorModify(calendarId, color) {
        const calendar = this.state.calendars.find(a => a.id === calendarId);
        const calendarData = {
            backgroundColor: color,
            summary: calendar.summary,
            description: calendar.description,
            foregroundColor: '#ffffff'
        };

        updateCalendarList(calendarId, calendarData)
            .then(result => {
                this.toastObj.hide('All');
                this.toastObj.showProgressBar = false;
                this.toastObj.show(this.toasts[1]);
                this.loadCalendarList(true);
                this.sidebarCalendarList();
            })
            .catch(error => {
                console.log('error ->', error);
                this.toastObj.showProgressBar = false;
                this.toastObj.hide('All');
                this.toastObj.show(this.toasts[2]);
            });
    }

    deleteCalendar(args) {
        this.toastObj.show(this.toasts[0]);
        const calendarid = args.currentTarget.id;


        deleteCalendar(args.currentTarget.id, this.props.lexon.userId)
            .then(result => {
                this.loadCalendarList(true);
                this.sidebarCalendarList();
                this.scheduleData = this.scheduleData.filter(obj => obj.CalendarId !== calendarid);
                this.scheduleObj.refreshEvents();

                this.toastObj.hide('All');
                this.toastObj.show(this.toasts[1]);
            })
            .catch(error => {
                console.log('error ->', error);
                this.toastObj.show(this.toasts[2]);
            });
    }
    // Calendar View Dialog
    openCalendarView(args) {
        let calendarId = "";
        if (args != undefined) {
            calendarId = args.currentTarget.id;
        }
        this.setState(
            {
                hidePromptDialog: true, calendarToEdit: calendarId
            });
    }
    // Calednar View Dialog
    dialogClose(args) {
        if (args == undefined) {
            this.loadCalendarList(true);
            this.sidebarCalendarList();

            this.toastObj.show(this.toasts[1]);
        }
        this.setState({
            hidePromptDialog: false
        });

        //this.promptButtonEle.style.display = 'inline-block';
    }
    // Calednar View Dialog
    dialogOpen() {
        //this.promptButtonEle.style.display = 'none';
    }
    // Calednar View Dialog
    onFocus(args) {
        //this.spanEle.classList.add('e-input-focus');
    }
    // Calednar View Dialog
    onBlur(args) {
        //this.spanEle.classList.remove('e-input-focus');
    }

    // EventType View Dialog
    openEventTypeView(args) {
        this.setState(
            {
                hidePromptEventTypeDialog: true
            });
    }

    // Event Type View Dialog
    dialogEventTypeClose(args) {
        if (args == undefined) {
            this.toastObj.show(this.toasts[1]);
        }
        this.setState({
            hidePromptEventTypeDialog: false
        });
    }

    // Import Concatcs View Dialog
    openImportConcatcsView(args) {
        this.setState(
            {
                showPromptImportContactsDialog: true
            });
    }

    // Import Concatcs View Dialog
    dialogImportConcatcsClose(args) {
        this.setState({
            showPromptImportContactsDialog: false
        });
    }

    async onExportEvents(eventData) {
        const { detail } = eventData;
        const { events, calendar } = detail;
        const errors = [];
        let eventsImported = 0;

        for (let i = 0; i < events.length; i++) {
            const sd = moment(events[i].startDate).toISOString();
            const ed = moment(events[i].endDate).toISOString();

            const lefEvent = {
                start: {
                    dateTime: sd,
                    timeZone: 'Europe/Madrid'
                },
                end: {
                    dateTime: ed,
                    timeZone: 'Europe/Madrid'
                },
                isAllDay: this.isAllDay(events[i]),
                summary: events[i].subject,
                attendees: []
            };

            try {
                const res = await addCalendarEvent(calendar, lefEvent, this.props.lexon.userId);
                eventsImported++;
            } catch (err) {
                errors.push({ event: events[i], error: err });
            }

            dispatchEvent(new CustomEvent('ExportEventsProgress', {
                detail: {
                    completed: false,
                    progress: Math.round(i * 100 / events.length),
                    errors,
                    eventsImported
                }
            }));
            await this.sleep(1000);
        }

        dispatchEvent(new CustomEvent('ExportEventsProgress', {
            detail: {
                completed: true, progress: 100, errors,
                eventsImported
            }
        }));
    }

    async sleep(time) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    }

    isAllDay(event) {
        if (event.startDate.endsWith("00:00:00.000000") && event.endDate.endsWith("00:00:00.000000") && event.startDate === event.endDate) {
            return true;
        }
        return false;
    }

    toastCusAnimation = {
        hide: { duration: '1' },
        show: { duration: '200' }
    };

    toastPreventDuplicate(e) {
        const toastEle = e.element;
        const toasts = e.toastObj.element.children;
        for (let i = 0; i < toasts.length; i++) {
            const toastTitle = toasts[i].querySelector('.e-toast-title');
            const toastMessage = toasts[i].querySelector('.e-toast-message');
            if (toastTitle && toastTitle.isEqualNode(toastEle.querySelector('.e-toast-title'))) {
                return true;
            }
            if (!toastTitle && toastMessage && toastMessage.isEqualNode(toastEle.querySelector('.e-toast-message'))) {
                return true;
            }
        }
        return false;
    }

    toastOnbeforeOpen(e) {
        e.cancel = this.toastPreventDuplicate(e);
    }

    toastOnclose(e) {
        if (e.toastContainer.childElementCount === 0) {
            this.toastBtnHide.element.style.display = 'none';
        }
    }

    editorTemplate(props) {
        // return ((props !== undefined) ? <div></div> : <div></div>);
    }

    getTimeString(value) {
        return this.instance.formatDate(value, { skeleton: 'hm' });
    }

    text_truncate(str, length, ending) {
        if (length == null) {
            length = 10;
        }
        if (ending == null) {
            ending = '...';
        }
        if (str.length > length) {
            return str.substring(0, length - ending.length) + ending;
        }
            return str;
    }

    eventTemplate(props) {
        const { t } = this.props;
        let colorExist = false;
        if (props.EventType != undefined) {
            colorExist = true;
        }
        let subjectStr = props.Subject;
        if (props.Subject != undefined) {
            subjectStr = this.text_truncate(props.Subject, 15);
        } else {
            subjectStr = t("schedule.notitle");
        }

        return (
            <div>
                <div className="image">
                    <div className={styles.eventicon}>

                        {props.LexonClassification && <img width="16" height="16" src={`assets/images/${props.ImageName}.png`} style={{marginRight: 5, marginBottom: 2 }}/>}
                        {subjectStr}
                        {colorExist ? (
                            <span style={{backgroundColor: props.EventType.color, marginTop: '3px'}}
                            className={`${styles.dot} ${styles.floatleft}`}/>
                        ) : (
                                ''
                            )}
                    </div>
                </div>
            </div>
        );
    }

    eventTemplateAgendaView(props) {
        const { t } = this.props;
        let colorExist = false;
        if (props.EventType != undefined) {
            colorExist = true;
        }
        let subjectStr = props.Subject;
        if (props.Subject != undefined) {
            props.Subject = this.text_truncate(props.Subject, 100);
        } else {
            subjectStr = t("schedule.notitle");
        }

        return (
            <div >
                <div className="image">
                    <span className='eventicon truncate'>
                        <img width="16" height="16" src={"assets/img/" + "lefebvre" + ".png"} />
                        {colorExist ? (
                            <span style={{backgroundColor: props.EventType.color, marginTop: '3px'}} className='dot dotagenda'></span>
                        ) : (
                                <span style={{backgroundColor: '#FFFFFF', marginTop: '3px'}} className='dot dotagenda'></span>
                            )}

                        {props.IsAllDay ? (
                            <span>todo el d�a</span>
                        ) : (

                                <span> {props.StartTime.toLocaleTimeString('es-ES')} - {props.EndTime.toLocaleTimeString('es-ES')}</span>
                            )}
                    </span>
                    <span className='space' > {subjectStr} </span>
                </div>
            </div>);
    }

    toggleSideBar() {
        const toggleCollapsed = !this.state.leftSideBar.collapsed;
        this.setState({
            leftSideBar: {
                collapsed: toggleCollapsed
            }
        });
    }

    onDataBinding(e, calendarId) {
        const items = this.dataManager.items;
        this.scheduleData = this.scheduleData.filter(i => i.CalendarId !== calendarId);
        if (items.length > 0) {
            for (let i = 0; i < items.length; i++) {
                const event = items[i];
                if (event.status === 'cancelled') {
                    const dateStartTime = new Date(event.originalStartTime.dateTime);
                    const dateString = `${moment(dateStartTime).seconds(0).toISOString().split('.')[0]}Z`;
                    const ExcRecurenceDate = dateString.replace(/[:.-]/g, "");
                    let ParentscheduleException = "";
                    let coma = "";
                    if (this.scheduleData.find(x => x.Id == event.recurringEventId).RecurrenceException != undefined) {
                        ParentscheduleException = this.scheduleData.find(x => x.Id == event.recurringEventId).RecurrenceException;
                        coma = ",";
                    }
                    this.scheduleData.find(x => x.Id == event.recurringEventId).RecurrenceException = ParentscheduleException + coma + ExcRecurenceDate;
                    continue;
                }

               // let when = event.start.dateTime;
                const start = event.start.dateTime;
                const end = event.end.dateTime;

                // Recurrence
                let recurrenceRule;
                if (event.recurrence != undefined) {
                    recurrenceRule = event.recurrence[0].replace('RRULE:', '');
                }
                // Attendees
                let attendees = [];
                if (event.attendees != undefined) {
                    attendees = event.attendees;
                } else {
                    attendees = undefined;
                }
                // EventType
                const eventType = {};
                const lexonClassification = null;
                if (event.categories != undefined) {
                    eventType.name = event.categories;
                    eventType.color = event.color;
                }

                let reminders = [];
                if (event.reminders != undefined) {
                    reminders = event.reminders;
                }

                this.scheduleData.push({
                    Id: event.id,
                    CalendarId: calendarId,
                    filename: event.filename,
                    Subject: event.summary,
                    Location: event.location,
                    Description: event.description,
                    StartTime: new Date(start),
                    EndTime: new Date(end),
                    IsAllDay: !event.start.dateTime,
                    Visibility: event.visibility,
                    RecurrenceRule: recurrenceRule,
                    ImageName: "icon-lefebvre-bl",
                    Attendees: attendees,
                    EventType: eventType,
                    Reminders: reminders,
                    LexonClassification: event.lexonActuation
                });
            }
        }
        e.result = this.scheduleData;
    }


    sendMessagePutUser(user) {
        const { email, lexon, calendarsResult } = this.props;

        const eventId = this.selectedEvent.Id.split("/").pop();
        let sm = [this.createLexonEvent({ ...this.selectedEvent, Guid: eventId })];

        if (this.state.showPromptImportContactsDialog) {
            sm = calendarsResult.calendars || [];
        }

        window.dispatchEvent(
            new CustomEvent('PutUserFromLexonConnector', {
                detail: {
                    user,
                    selectedMessages: sm,
                    idCaseFile: lexon.idCaseFile,
                    bbdd: lexon.bbdd,
                    idCompany: lexon.idCompany,
                    provider: lexon.provider,
                    account: email,
                    app: this.state.showPromptImportContactsDialog ? 'calendar:import' : 'calendar',
                    env: window.currentUser ? window.currentUser.env : null
                }
            })
        );
    }

    createLexonEvent(event) {
        return {
            Subject: event.Subject,
            Guid: event.Id,
            StartTime: event.StartTime,
            EndTime: event.EndTime,
            calendar: {
                title: event.calendar.summary,
                description: '',
                color: event.calendar.backgroundColor,
                fgColor: '#000000'
            },
            EventType: event.eventType ? {
                eventTypeName: event.eventType.name,
                eventTypeColor: event.eventType.color
            } : undefined,
            reminders: event.reminders
        };
    }

    handleGetUserFromLexonConnector(event) {
        const { userId } = this.props.lexon;
        if (userId) {
            this.sendMessagePutUser(userId);
        }
    }

    onSetSidebarOpenCalendar(open) {
        this.setState({
            sidebarComponent: (
                <CalendarComponent sidebarDocked={this.onSetSidebarDocked} />
            )
        });
        this.setState({ sidebarDocked: open }, () => {
            this.forceUpdate();
        });
    }

    onSetSidebarOpenLexon(open) {
        this.setState({
            sidebarComponent: (
                <LexonComponent sidebarDocked={this.onSetSidebarDocked} />
            )
        });
        this.setState({ sidebarDocked: open }, () => {
            this.forceUpdate();
        });
    }

    onSetSidebarDocked(open) {
        this.setState({ sidebarDocked: open });
    }

    async componentDidMount() {
        console.log("***************** componentDidMount *****************")

        if (this.layoutIframe) {
            this.setState({ leftSideBar: { collapsed: true } });
        }
        document.title = 'Lefebvre Calendar';
        const {
            userId,
            idCaseFile,
            bbdd,
            idEmail,
            idFolder,
            account,
            mailContacts
        } = this.props.lexon;
        const {
            imapSsl,
            serverHost,
            serverPort,
            smtpHost,
            smtpPort,
            smtpSsl,
            smtpTls,
            user,
            password
        } = this.props.all.login.formValues;
        const { email } = this.props;
          console.log('ENVIRONMENT ->', window.REACT_APP_ENVIRONMENT);

          if (userId) {
            setTimeout(async () => {
                await createCalendarUser(userId);
            });
        }

         this.sidebarCalendarList();

        //Firefox load is slow and need to take into account wait more time to be ready
        let value = 100;
        const obj = this;
        if (navigator.userAgent.toLowerCase().indexOf('firefox') > 0) {
            value = 250;
        }

        if (obj.layoutIframeNewEventView) {
            value = 1000;
        }

        this.setState({ schedule: obj.scheduleObj }, () => {
            setTimeout(() => {
                obj.loadCalendarList();
                obj.getlistEventTypes();

                const openEditorFnc = (me, mode) => {
                    if (this.loading === false || this.scheduleObj === null) {
                        if (mode === 'new') {
                            me.handleScheduleOpenNewEventEditor();
                        } else if (mode === 'edit') {
                            me.handleScheduleOpenEditEventEditor();
                        }
                    } else {
                        setTimeout(() => {
                            openEditorFnc(me, mode);
                        }, 1000);
                    }
                };


                // New event is called
                if (obj.layoutIframeNewEventView) {
                    openEditorFnc(obj, 'new');
                }

                // Edit event is called
                if (obj.layoutIframeEditEventView) {
                    openEditorFnc(obj, 'edit');
                }
            }, value);
        });

        window.addEventListener(
            'GetUserFromLexonConnector',
            this.handleGetUserFromLexonConnector
        );


        window.addEventListener(
            'EventClassified',
            this.handleClassificatedEvent
        );

        window.addEventListener(
            'RemoveSelectedEvent',
            this.handleClassificatedEventRemoved
        );
    }

    onDataBindingEventTypeList(items) {
        this.eventTypeDataSource = [];
        if (items.length > 0) {
            for (let i = 0; i < items.length; i++) {
                const evt = items[i];
                this.eventTypeDataSource.push({
                    text: evt.name,
                    id: evt.idEvent,
                    backgroundColor: evt.color
                });
            }
        }
        if (this.drowDownListEventType != undefined) {
            this.drowDownListEventType.dataSource = this.eventTypeDataSource;
        }
    }

    getlistEventTypes() {
        if (this.props.email) {
            getEventTypes(this.props.email)
                .then(result => {
                    if (result && result.data) {
                        if (result.data && result.data.eventTypes) {
                            this.onDataBindingEventTypeList(result.data.eventTypes);
                        }
                    }
                })
                .catch(error => {
                    console.log('error ->', error);
                });
        }
    }

    loadCalendarList(DisableloadSchedule) {
        console.log("***************** loadCalendarList ***************** " + DisableloadSchedule?'true':'false')

        const { userId } = this.props.lexon;
        this.loading = true;


        this.resourceCalendarData = [];
        listCalendarList(userId)
        .then(result => {
            this.resourceCalendarData = orderBy(result.items, "primary");
            this.props.getCalendars(this.resourceCalendarData);
            const existChange = this.state.calendars.filter(calendar => !result.items.some(item => item.backgroundColor === calendar.backgroundColor
                  && item.summary === calendar.summary
                  && item.description === calendar.description));
            if (this.state.calendars.length !== result.items.length || existChange.length > 0) {
                this.setState({ calendars: result.items });
                this.resourceCalendarData = orderBy(result.items, "primary");
                this.props.getCalendars(this.resourceCalendarData);
                this.resourceCalendarData.find(x => x.id === this.resourceCalendarData[0].id).checked = true;
                this.loadCalendarEvents(this.resourceCalendarData[0].id, true);
                if (!DisableloadSchedule) {

                    console.log("Refreshing Data 2");
                    this.scheduleObj.refresh();
                }
            }
        })
        .catch(error => {
            this.loading = false;
            console.log('error ->', error);
        });
    }


    createGuid() {
        function _p8(s) {
            const p = (`${Math.random().toString(16)}000000000`).substr(2, 8);
            return s ? `-${p.substr(0, 4)}-${p.substr(4, 4)}` : p;
        }
        return _p8() + _p8(true) + _p8(true) + _p8();
    }

    convertTZ(date, tzString) {
        return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", { timeZone: tzString }));
    }

    newVar;

    buildEventoCalDav(values, isNew = false) {
        let timezoneEnd = 'Europe/Madrid';
        if (values.EndTimezone != undefined) {
            timezoneEnd = values.EndTimezone;
        }

        let timezoneStart = 'Europe/Madrid';
        if (values.StartTimezone != undefined) {
            timezoneStart = values.StartTimezone;
        }

        //important to update event
        let filename = "";
        const saveType = isNew ? "new" : "update";

        if (typeof values.Id === 'string') {
            filename = values.Id.startsWith(values.CalendarId) ? values.Id : values.CalendarId + values.Id;
        } else {
            const guid = this.createGuid();
            filename = values.CalendarId + guid;
            values.Guid = guid;
            if (!values.Id) {
                values.Id = guid;
            }
        }

        //Event basic data
        this.newVar = {
            allDay: values.IsAllDay,
            summary: values.Subject,
            location: values.Location,
            description: values.Description,
            start: moment(values.StartTime),
            end: moment(values.EndTime).add(1, 'days'),
            timezone: 'Europe/Madrid',
            filename: filename,
            saveType: saveType
        };
        const event = this.newVar;
        //event Type
        if (values.EventType != undefined && values.EventType != null && values.EventType.length > 0) {
            let item;
            if (values.EventType.name != undefined) {
                item = this.eventTypeDataSource.find(x => x.text == values.EventType.name);
            } else {
                item = this.eventTypeDataSource.find(x => x.text == values.EventType);
            }
            event.color = item.backgroundColor;
            event.categories = [{
                name: item.text
            }];
        }

        //Recurrence
        if (values.RecurrenceRule != undefined) {
           const recurrenceEvent = this.getRecurrenceEvent(values.RecurrenceRule);
           event.repeating = recurrenceEvent;
        }

        //Atendees
        const arr = this.state.to2;
        const ateendeeObj = [];
        if (arr.length > 0) {
            Object.keys(arr).forEach(key => {
                ateendeeObj.push({
                    name: arr[key],
                    email: arr[key],
                    mailto: arr[key],
                    type: 'individual'
                });
            });
        }

        const organizerData = {
            name: "Alberto",
            email: "alberto.valverde.escribano@gmail.com",
            mailto: "alberto.valverde.escribano@gmail.com" //to override email
        };


        event.organizer = organizerData;
        event.attendees = ateendeeObj;

        if (values.LexonClassification) {
            const cat = values.LexonClassification;
            event.x = { key: 'X-ACTUATION', value: `${cat}`};
        }
        event.organizer = organizerData;

        if (this.remObj && this.remObj.listviewInstance) {
            const arrR = this.remObj.listviewInstance.dataSource;
            if (arrR.length > 0) {
                event.reminders = [];
                Object.keys(arrR).forEach(key => {
                    event.reminders.push({
                        type: 'display',
                        trigger: arrR[key].minutesvalue
                    });
                });
            }
        }
        return event;
    }

    getRecurrenceEvent(recurrenceRule) {
        const valueList = recurrenceRule.split(';');
        let freqValue = null;
        let intervalValue = null;
        let untilValue = null;
        let byDayValue = null;
        let bySetPosValue = null;
        let byMonthValue = null;
        let byMonthDayValue = null;
        let countValue = null;
        valueList.forEach(value => {
             if (value.split('=')[0] === 'FREQ') {
                 freqValue = value.split('=')[1];
             } else if (value.split('=')[0] === 'INTERVAL') {
                 intervalValue = value.split('=')[1];
             } else if (value.split('=')[0] === 'BYDAY') {
                 byDayValue = value.split('=')[1];
             } else if (value.split('=')[0] === 'BYSETPOS') {
                 bySetPosValue = value.split('=')[1];
             } else if (value.split('=')[0] === 'BYMONTH') {
                 byMonthValue = value.split('=')[1];
             } else if (value.split('=')[0] === 'BYMONTHDAY') {
                 byMonthDayValue = value.split('=')[1];
             } else if (value.split('=')[0] === 'UNTIL') {
                 untilValue = value.split('=')[1];
             } else if (value.split('=')[0] === 'COUNT') {
                 countValue = value.split('=')[1];
             }
        });
        const repeating = {
             freq: freqValue,
             count: null,
             interval: intervalValue,
             byDay: byDayValue,
             byMonth: parseInt(byMonthValue),
             byMonthDay: parseInt(byMonthDayValue),
             bySetPos: parseInt(bySetPosValue),
             wkst: countValue // Start the week on Sunday, default is Monday
         };
         if (untilValue) {
            repeating.until = moment(untilValue);
         }

        return repeating;
    }

    onEventDragStart(args) {
        //if (args.data.RecurrenceRule != undefined) {
        //    args.navigation.enable = false;
        //    //args.cancel = true; //cancels the drop action

        //}
        //else {
        //    //enable the drop action
        //    args.navigation.enable = true;
        //}
        ////setTimeout(function () {
        ////    args.cancel = false;
        ////}, 500);

    }

    onEventDragStop(args) {
        //args.cancel = false
    }

    onEventClick(args) {
        const a = args;
    }

    tabContent() {
        return (
            <LexonComponentCalendar />
        );
    }

    selectingTab(args) {
        const formElement = this.scheduleObj.eventWindow.element.querySelector('.e-schedule-form');
        const validator = (formElement).ej2_instances[0];
        validator.validate();

        if (validator.errorRules.length <= 0) {
            this.cancel = false;
            if (args.selectedIndex === 0 && args.selectingIndex === 1) {
                const subjectElement = document.getElementsByClassName('e-subject')[0];
                if (this.selectedEvent && (!this.selectedEvent.Subject) || (this.selectedEvent.Subject === '')) {
                    this.selectedEvent.Subject = subjectElement ? subjectElement.textContent : '';
                }

                // Hide buttons
                const buttons = document.getElementsByClassName("e-footer-content");
                if (buttons) {
                    for (let i = 0; i < buttons.length; i++) {
                        buttons[i].style.visibility = 'hidden';
                    }
                }
            } else if (args.selectedIndex === 1 && args.selectingIndex === 0) {
                // Show buttons
                const buttons = document.getElementsByClassName("e-footer-content");
                if (buttons) {
                    for (let i = 0; i < buttons.length; i++) {
                        buttons[i].style.visibility = 'visible';
                    }
                }
            }

            if (this.tabObj.selectingID === "1") {
                // this.tabObj.refresh()
                const id = this.scheduleObj.eventWindow.eventData.Id;
                if (id === undefined) {
                    this.scheduleObj.addEvent(this.scheduleObj.eventWindow.getEventDataFromEditor().eventData);
                    this.scheduleObj.eventWindow.eventData.typeEvent = "lexon";
                } else {
                    this.scheduleObj.saveEvent(this.scheduleObj.eventWindow.eventData);
                }
            }
        } else {
            args.cancel = true;
        }
    }

    eventTypeTemplate(data) {
        return (
            <div className="typeitem">
                <span>
                    <span style={{backgroundColor: data.backgroundColor, marginRight: '20px'}} className={styles.dot}></span>
                    <span className='name'>{data.text}</span>
                </span>
            </div>
        );
    }

    ToogleCalendarResourceDirective(args) {
        if (args.data.Id != undefined) {
            console.log(this.scheduleObj.resourceCollection[0].cssClassField);
            ////  this.scheduleObj.resourceCollection[0].cssClassField = "hidden"
            var cal = document.getElementsByClassName("e-CalendarId-container");
            cal[0].classList.add('disabledbutton');
        } else {
            var cal = document.getElementsByClassName("e-CalendarId-container");
            cal[0].classList.remove('disabledbutton');
        }
    }

    doubleOpen(args) {
        if (this.layoutIframe) {
            args.cancel = true;
            window.open("calendar", "_blank");
        }
    }

    onPopupOpen(args) {
        const { t } = this.props;
        //if (this.layoutIframe) {
        //    args.cancel = true;
        //}
        if (window != window.top) {
            const DateMessage = args.data.startTime;
            window.top.postMessage(
                JSON.stringify({
                    idEvent: args.data.Id,
                    actionCancelled: false,
                    selectedDate: DateMessage
                }),
                window.URL_LEXON
            );
        }

        //Not allow to change calendar property on update events
        this.ToogleCalendarResourceDirective(args);

        //Not allow to change calendar property on update events
        if (args.data.Id != undefined) {
            console.log(this.scheduleObj.resourceCollection[0].cssClassField);
            ////  this.scheduleObj.resourceCollection[0].cssClassField = "hidden"
            var cal = document.getElementsByClassName("e-CalendarId-container");
            cal[0].classList.add('disabledbutton');
        } else {
            var cal = document.getElementsByClassName("e-CalendarId-container");
            cal[0].classList.remove('disabledbutton');
        }

        // default values for EventType coming from event args
        if (args.data.EventType != undefined) {
           this.setState({ eventType: args.data.EventType.name });
           if (this.drowDownListEventType != undefined) {
               this.drowDownListEventType.value = args.data.EventType.name;
           }
        } else {
           this.setState({ eventType: undefined });
           //this.drowDownListEventType.value = undefined;
        }

        // default values for Atendees coming from event args
        if (args.data.Attendees != undefined) {
            //const peopleArray = Object.keys(args.data.Attendees).map(i => args.data.Attendees[i])
            const arr = [];
            Object.keys(args.data.Attendees).forEach(key => {
                arr.push(args.data.Attendees[key].email);
            });
            this.setState({ to2: arr });
        } else {
            this.setState({ to2: [] });
        }

        // default values for Visibility coming from event args
        //if (args.data.Visibility != undefined) {
        //    const isVisibility = args.data.Visibility == 'private' ? true : false;
        //    this.setState({ isVisibility: isVisibility });
        //    if (this.drowDownListVisibility != undefined) {
        //        this.drowDownListVisibility.checked = isVisibility;
        //    }
        //}

        // default values for Reminders coming from event args

        if (args.data.Reminders != undefined) {
           const arr = [];
           Object.keys(args.data.Reminders).forEach(key => {
               arr.push({
                   title: args.data.Reminders[key].method,
                   value: args.data.Reminders[key].minutes,
                   minutesvalue: args.data.Reminders[key].minutes,
                   id: 'n',
                   icon: "delete-icon"
               });
           });
           this.setState({ reminders: arr });
        } else {
           this.setState({ reminders: [] });
        }


        if (args.type === 'QuickInfo') {
            if (this.layoutIframe) {
                const buttonElementEdit = ".e-event-popup .e-edit";
                var removeButton = document.querySelector(buttonElementEdit);
                if (removeButton != undefined) {
                    removeButton.disabled = true;
                }

                if (args.data.Id === undefined) {
                    args.cancel = true;
                } else {
                    const content = document.getElementsByClassName("e-popup-content");
                    content[0].classList.add('hidden');
                }
            }

            //Not allow to update events of not owner or writer calendar permissions
            const calendar = this.resourceCalendarData.find(x => x.id == args.data.CalendarId);
            if (!calendar) {
                return;
            }
            const calendarRole = calendar.accessRole;
            if (calendarRole != "owner" &&
                calendarRole != "writer") {
                const buttonElementRemove = args.type === "QuickInfo" ? ".e-event-popup .e-delete" : ".e-schedule-dialog .e-event-delete";
                var removeButton = document.querySelector(buttonElementRemove);
                if (removeButton != undefined) {
                    removeButton.disabled = true;
                }
            }


            var formElement = args.element.querySelector('.e-schedule-form');
            if (formElement != null) {
                var validator = (formElement).ej2_instances[0];
                validator.addRules('Subject', { required: [true, t("schedule.validator-required")] });
            }
        }
        if (args.type === 'Editor') {
            this.currentClassification = args.data.LexonClassification;

            setTimeout(() => {
                const dlg = document.getElementById("schedule_dialog_wrapper");
                let btn = dlg.getElementsByClassName('e-dlg-closeicon-btn');
                if (btn && btn.length > 0) {
                    btn[0].onclick = this.onCloseDialog;
                }

                btn = dlg.getElementsByClassName('e-event-cancel');
                if (btn && btn.length > 0) {
                    btn[0].onclick = this.onCloseDialog;
                }
            }, 1000);

            if (this.layoutIframe & this.layoutIframeNewEventView || this.layoutIframeEditEventView) {
                const head = document.getElementById("schedule_dialog_wrapper_dialog-header");
                head.classList.add('e-hidden');
            }

            this.selectedEvent = { ...args.data };

            var editButton = document.querySelector('.e-event-delete');
            editButton.disabled = false;

            var editButtonSave = document.querySelector('.e-event-save');
            editButtonSave.hidden = false;

            if (args.data.Id != undefined) {
                const calendarRole = this.resourceCalendarData.find(x => x.id == args.data.CalendarId).accessRole;
                if (calendarRole != "owner" &&
                    calendarRole != "writer") {
                    var editButton = document.querySelector('.e-event-delete');
                    editButton.disabled = true;

                    var editButtonSave = document.querySelector('.e-event-save');
                    editButtonSave.hidden = true;
                }
            }


            const dialogObj = args.element.ej2_instances[0];
            dialogObj.buttons[1].buttonModel.isPrimary = false;
            args.element.style.width = "900px";
            args.element.style.height = "800px";

            var formElement = args.element.querySelector('.e-schedule-form');
            if (formElement != null) {
                var validator = (formElement).ej2_instances[0];
                validator.addRules('Subject', { required: [true, t("schedule.validator-required")] });
            }

            // Create required custom elements in initial time
            if (!args.element.querySelector('.custom-field-row')) {
                const row = createElement('div', { className: 'custom-field-row' });
                const rowAttendes = createElement('div', { className: 'custom-field-row' });
                const rowReminders = createElement('div', { className: 'custom-field-row' });
                const formElement = args.element.querySelector('.e-schedule-form');

                formElement.firstChild.insertBefore(rowAttendes, formElement.firstChild.firstChild);
                formElement.firstChild.insertBefore(row, formElement.lastChild.lastChild);
                formElement.firstChild.insertBefore(rowReminders, formElement.lastChild.lastChild);


                // Adding event type element
                const containerEventType = createElement('div', { className: 'custom-field-container' });
                row.appendChild(containerEventType);
                const inputEle = createElement('input', {
                   className: 'e-field', attrs: { name: 'EventType' }
                });
                containerEventType.appendChild(inputEle);

                this.drowDownListEventType = new DropDownList({
                   itemTemplate: this.eventTypeTemplate = this.eventTypeTemplate.bind(this),
                   dataSource: this.eventTypeDataSource,
                   value: this.state.eventType,
                   floatLabelType: 'Always', placeholder: t("schedule.eventtype")
                });
                this.drowDownListEventType.appendTo(inputEle);
                inputEle.setAttribute('name', 'EventType');


                // Adding visibility element
                //let containerVisibility = createElement('div', { className: 'custom-field-container' });
                //row.appendChild(containerVisibility);
                //let inputVisibility = createElement('input', {
                //    className: 'e-field', attrs: { name: 'Visibility' }
                //});
                //containerVisibility.appendChild(inputVisibility);

                //this.drowDownListVisibility = new CheckBoxComponent({
                //    value: this.state.isVisibility,
                //    label: t("schedule.visibility"),
                //    checked: this.state.isVisibility
                //});

                //this.drowDownListVisibility.appendTo(inputVisibility);
                //inputVisibility.setAttribute('name', 'Visibility');


                // Adding attendees2 tag element
                const containerTab2 = createElement('div', { className: 'custom-field-container' });
                rowAttendes.appendChild(containerTab2);
                const nodeA = ReactDOM.findDOMNode(this.tagObjHead);
                containerTab2.appendChild(nodeA);

                //// Adding attendees tag element
                //let containerTab = createElement('div', { className: 'custom-field-container' });
                //rowAttendes.appendChild(containerTab);
                //var nodeA = ReactDOM.findDOMNode(this.tagObj);
                //containerTab.appendChild(nodeA);

                // Adding reminder element
                const containerRem = createElement('div', { className: 'custom-field-container' });
                rowReminders.appendChild(containerRem);
                const nodeR = ReactDOM.findDOMNode(this.remObj);
                containerRem.appendChild(nodeR);
            }

            // if from iframe is requested a new event
            if (!this.layoutIframeNewEventView & !this.layoutIframeEditEventView) {
                const TabContainer = args.element.querySelector('.custom-tab-row');
                if (TabContainer === null) {
                    if (args.element.querySelector('.e-dlg-content')) {
                        const formContainer = args.element.querySelector('.e-schedule-form');
                        const Element = args.element.querySelector('.e-dlg-content');
                        const row = createElement('div', { className: 'custom-tab-row' });
                        Element.firstChild.insertBefore(row, Element.firstChild.firstChild);
                        this.tabObj = new TabComponent({
                            items: [
                                { header: { text: 'EVENTO', iconCss: 'e-twitter', iconPosition: 'right' }, content: formContainer },
                                { header: { text: 'LEX-ON', iconCss: 'e-twitter', iconPosition: 'right' }, content: this.tabContent }
                            ],
                            selectedItem: 0,
                            selecting: this.selectingTab.bind(this)

                            //headerPlacement: 'Left',
                        });
                        //tabObj.select(1);
                        this.tabObj.animation.previous = { duration: 100 };
                        this.tabObj.animation.next = { duration: 100 };
                        this.tabObj.animation.previous = { effect: 'FadeIn' };
                        this.tabObj.animation.next = { effect: 'FadeIn' };
                        this.tabObj.appendTo(row);
                    }
                } else {
                    console.log(this.tabInstance);
                    this.tabObj.selectedItem = 0;
                    console.log("Refreshing Data 3");
                    this.tabObj.refresh();
                    //}
                }
            }
        }
    }

    addLogOutButton(args) {
        const scheduleElement = document.getElementById('schedule');
        if (args.requestType === 'toolBarItemRendered') {
            const logoutIconEle = scheduleElement.querySelector('.e-schedule-logout-icon');
            logoutIconEle.onclick = () => {
                // alert('logout');
                signOut();
                window.location.reload();
            };
        }
        const logoutContentEle = createElement('div', {
            className: 'e-profile-wrapper'
        });

        scheduleElement.parentElement.appendChild(logoutContentEle);
    }

    addCalendarsButton(args) {
        const scheduleElement = document.getElementById('schedule');
        if (args.requestType === 'toolBarItemRendered') {
            const calendarIconEle = scheduleElement.querySelector('.e-schedule-calendar-icon');
            calendarIconEle.onclick = () => {
                this.toggleSideBar();
                //this.profilePopupCalendar.relateTo = calendarIconEle;
                //this.profilePopupCalendar.dataBind();
                //if (this.profilePopupCalendar.element.classList.contains('e-popup-close')) {
                //    this.profilePopupCalendar.show();
                //}
                //else {
                //    this.profilePopupCalendar.hide();
                //}
            };
        }
        //let calendarContentEle = createElement('div', {
        //    className: 'e-profile-wrapper'
        //});

        //scheduleElement.parentElement.appendChild(calendarContentEle);

        //scheduleElement.parentElement.appendChild(calendarContentEle);
        //let calendarIconEle = scheduleElement.querySelector('.e-schedule-calendar-icon');

        //let output = this.sidebarObj;
        //this.profilePopupCalendar = new Popup(calendarContentEle, {
        //    content: output,
        //    relateTo: calendarIconEle,
        //    position: { X: 'left', Y: 'bottom' },
        //    collision: { X: 'flip', Y: 'flip' },
        //    targetType: 'relative',
        //    viewPortElement: scheduleElement,
        //    width: 150,
        //    height: 300
        //});
        //this.profilePopupCalendar.hide();
    }

    addConfigurationButton(args) {
        const scheduleElement = document.getElementById('schedule');
        if (args.requestType === 'toolBarItemRendered') {
            const userIconEle = scheduleElement.querySelector('.e-schedule-user-icon');
            userIconEle.onclick = () => {
                this.profilePopup.relateTo = userIconEle;
                this.profilePopup.dataBind();
                if (this.profilePopup.element.classList.contains('e-popup-close')) {
                    this.profilePopup.show();
                } else {
                    this.profilePopup.hide();
                }
            };
        }
        const userContentEle = createElement('div', {
            className: 'e-profile-wrapper'
        });

        scheduleElement.parentElement.appendChild(userContentEle);
        const userIconEle = scheduleElement.querySelector('.e-schedule-user-icon');
        const output = this.buttonEventTypeObj;
        this.profilePopup = new Popup(userContentEle, {
            content: output,
            relateTo: userIconEle,
            position: { X: 'left', Y: 'bottom' },
            collision: { X: 'flip', Y: 'flip' },
            targetType: 'relative',
            viewPortElement: scheduleElement,
            width: 150,
            height: 60
        });
        this.profilePopup.hide();
    }

    onEventRendered(args) {
        let event;

        switch (args.requestType) {
            case 'toolBarItemRendered':

                //if not iframe view
                if (!this.layoutIframe) {
                    this.addConfigurationButton(args);
                } else {
                    this.addLogOutButton(args);
                }
                this.addCalendarsButton(args);
                break;

            case 'eventChanged':
                let idEvent;
                if (args.data[0] != undefined) {
                    idEvent = args.data[0].Id;
                    if (typeof args.data[0].Id !== 'string') {
                        args.data[0].Guid = this.localEvents[args.data[0].Id];
                    }
                } else {
                    idEvent = args.data.Id;
                    if (typeof args.data.Id !== 'string') {
                        args.data.Guid = this.localEvents[args.data.Id];
                    } else {
                        args.data.Guid = args.data.Id.split("/").pop();
                    }
                }

                var desc = this.scheduleObj.dataModule.dataManager.dataSource.json.find(e => e.Id === idEvent);

                if (desc) {
                    //reset reminders
                    desc.Reminders = [];

                    // Update Reminders
                    const arrR = this.remObj.listviewInstance.dataSource;
                    if (arrR.length > 0) {
                       Object.keys(arrR).forEach(key => {
                           desc.Reminders.push({
                               type: 'display',
                               trigger: arrR[key].value
                           });
                       });
                    }

                    //reset attendess
                    desc.Attendees = [];

                    //Update Attendess
                    const att = this.state.to2;
                    if (att != undefined) {
                        Object.keys(att).forEach(key => {
                            desc.Attendees.push({ email: att[key] });
                        });
                    }
                    desc.LexonClassification = this.currentClassification;
                }

                //Update the schedule datasource
                this.scheduleObj.dataModule.dataManager.update();
                args.data.LexonClassification = this.currentClassification;

                //update the Event to call the api
                args.data.Id = args.data.CalendarId + args.data.Guid;
                event = this.buildEventoCalDav(args.data);

                const itemToModify = args.data.Id;
                //let itemToModify = desc.CalendarId
                let calendarToModify = args.data.CalendarId;
                if (args.data.occurrence != undefined) {
                    //call function to remvove event from serie
                    let eventItemToModify;
                    const singleEventToRemove = args.changedRecords[0].RecurrenceException.split(",");
                    if (singleEventToRemove.length > 0) {
                        eventItemToModify = `${args.data.parent.Id}_${singleEventToRemove[singleEventToRemove.length - 1]}`;
                    } else {
                        eventItemToModify = `${args.data.parent.Id}_${singleEventToRemove[0]}`;
                    }
                    this.deleteCalendarEventCRUD(args.data.parent.CalendarId, eventItemToModify, true);

                    //call function to add new single event out of the serie
                    args.addedRecords[0].RecurrenceRule = undefined;
                    const eventOcurrence = this.buildEventoCalDav(args.addedRecords[0]);
                    this.addCalendarEventCRUD(args.data.parent.CalendarId, eventOcurrence);
                    break;
                }
                if (args.changedRecords[0] != undefined) {
                    calendarToModify = args.changedRecords[0].CalendarId;
                    args.changedRecords[0].LexonClassification = this.currentClassification;
                    event = this.buildEventoCalDav(args.changedRecords[0]);
                }

                //call function to update event
                this.updateCalendarEventCRUD(calendarToModify, itemToModify, event);

                break;

            case 'eventCreated':

                // if event is all day add one less day
                const EndTime = moment(args.data[0].EndTime); //.add(1, 'days');
                args.data[0].StartTime = moment(args.data[0].StartTime).add(1, 'days');

                if (args.data[0].IsAllDay) {
                    args.data[0].EndTime = EndTime._d;
                    args.data[0].endTime = EndTime._d;
                }

                event = this.buildEventoCalDav(args.data[0], true);

                // if the calendar is not checked remove from current view
                if (!this.resourceCalendarData.find(x => x.id == args.data[0].CalendarId).checked) {
                    delete this.scheduleObj.dataModule.dataManager.dataSource.json.splice(-1, 1);
                }

                if (args.data[0].EventType != undefined && args.data[0].EventType != null) {
                    let item;
                    item = this.eventTypeDataSource.find(x => x.text == args.data[0].EventType);
                    // create EventType with structure
                    const eventType = [];
                    if (item != undefined) {
                        eventType.name = item.text;
                        eventType.id = item.id;
                        eventType.color = item.backgroundColor;
                        args.data[0].eventType = eventType;
                    }
                }
                this.selectedEvent = { ...args.data[0], calendar: { ...calendar } };
                const calendar = this.resourceCalendarData.find(x => x.id === this.selectedEvent.CalendarId);

                addCalendarEvent(args.data[0].CalendarId, event, this.props.lexon.userId)
                    .then(result => {
                        // refresh event data
                        if (this.scheduleObj.eventWindow.eventData != undefined) {
                            this.scheduleObj.eventWindow.eventData.Subject = event.summary;
                        }

                        this.localEvents[args.data[0].Id] = args.data[0].Guid;
                        // this.scheduleObj.eventWindow.resetForm();
                        //args.data[0].Id = event.filename;
                        args.data[0].ImageName = "icon-lefebvre-bl";
                        args.data[0].Attendees = event.attendees;

                        //args.data[0].ImageName = "lefebvre";
                        this.setState({ to2: [] });
                        if (window != window.top) {
                            this.onCloseDialog();
                        }
                        this.toastObj.show(this.toasts[1]);
                        if (this.props.lexon.idActuation) {
                            this.classifyEventOnLexon(args.data[0], this.props.lexon.idActuation).then(() => {
                                console.log("Event classified on Lexon");
                            });
                        }

                        this.loadCalendarEvents(args.data[0].CalendarId, true);
                    })
                    .catch(error => {
                         this.toastObj.show(this.toasts[2]);
                         console.log('error ->', error);
                    });

                break;

            case 'eventRemoved':
                //call function to delete event
                let item = args.data[0].Id;
                let calendarFromRemove = args.data[0].CalendarId;
                if (args.data[0].occurrence != undefined) {
                    const d = new Date(args.data[0].occurrence.StartTime);
                    const dateString = `${moment(d).seconds(0).toISOString().split('.')[0]}Z`;
                    const ExcRecurenceDate = dateString.replace(/[:.-]/g, "");
                    item = `${args.data[0].parent.Id}_${ExcRecurenceDate}`;
                    calendarFromRemove = args.changedRecords[0].CalendarId;
                    // item = args.data[0].parent.Id + '_' + args.data[0].parent.RecurrenceException;
                }

                //call function to remvove event
                this.deleteCalendarEventCRUD(calendarFromRemove, item, false, args.data[0]);

                break;
        }

        //this.scheduleObj.eventWindow.dialogObject.beforeClose = function (args) {
        //    args.cancel = true;

        //}
    }

    async classifyEventOnLexon(event, idActuation) {
        const { provider, userId, bbdd, env } = this.props.lexon;
        const { idUser } = this.props.currentUser;

        const calendar = this.resourceCalendarData.find(c => c.id === event.CalendarId);
        const st = moment(event.StartTime).format('YYYY-MM-DD HH:mm');
        const et = moment(event.EndTime).format('YYYY-MM-DD HH:mm');

        const lexonEvent = {...event, Guid: event.Id, calendar, StartTime: st, EndTime: et};
        const sc = await createAppoinment(bbdd, { idUser, provider }, lexonEvent);
        await addEventToActuation(bbdd, idUser, sc.result.data, idActuation);

        // Clear idActuation
        this.props.resetIdActuation();
        event.LexonClassification = idActuation;
        await this.handleClassificatedEvent({detail: { ...event, Guid: event.Id }});
        window.location.reload();
    }


    addCalendarEventCRUD(CalendarId, event, hiddeMessage) {
        addCalendarEvent(CalendarId, event, this.props.lexon.userId)
            .then(result => {
                if (!hiddeMessage) {
                    this.toastObj.show(this.toasts[1]);
                }
            })
            .catch(error => {
                this.toastObj.show(this.toasts[2]);
                console.log('error ->', error);
            });
    }

    deleteCalendarEventCRUD(calendarId, item, hiddeMessage, args) {
        const filename = item;
        deleteCalendarEvent(filename, this.props.lexon.userId)
            .then(result => {
                if (!hiddeMessage) {
                    this.toastObj.show(this.toasts[1]);
                }
            })
            .catch(error => {
                this.toastObj.show(this.toasts[2]);
                console.log('error ->', error);
            });
    }

    updateCalendarEventCRUD(calendarId, item, event, hiddeMessage, args) {
        addCalendarEvent(calendarId, event, this.props.lexon.userId)
            .then(result => {
                this.loadCalendarEvents(calendarId, true);
                if (!hiddeMessage) {
                    this.toastObj.show(this.toasts[1]);
                }
            })
            .catch(error => {
                this.toastObj.show(this.toasts[2]);
                console.log('error ->', error);
            });
    }

    loadCalendarEvents(calendar, checked) {
        if (this.scheduleObj) {
            this.scheduleObj.showSpinner();
        }
        let predicate;


        const obj = this;
        getEventList(calendar, this.props.lexon.userId, '')
            .then(result => {
                this.defaultCalendar = calendar;
                //Set checkedCalendarResourceData calendar items as cheked
                this.resourceCalendarData.find(x => x.id == calendar).checked = checked;

                // if calandar from left sidebar list is checked load the main event list
                if (checked) {
                    this.dataManager = result.result;
                    this.onDataBinding(this.dataManager, calendar);
                }
                // if not remove from main event list
                else {
                    this.scheduleData = this.scheduleData.filter(obj => obj.CalendarId !== calendar);
                }

               this.props.selectCalendar(calendar);

                // Filter selected calendar to pass to the query
                const calendars = groupBy(this.resourceCalendarData, "checked");

                // Set the calendar field as default when only one calendar is checked
                this.setDefaultCalendarField(calendars.true, calendar);

                // Load selected calendar to pass to the query
                this.predicateQueryEvents(calendars.true, predicate);
                this.loading = false;
            })
            .catch(error => {
                this.loading = false;
                console.log('error ->', error);
            });
    }

    setDefaultCalendarField(calendarList, calendar) {
        if (calendarList != undefined) {
            if (calendarList.length > 0) {
                calendarList.every(key => {
                    if (key.checked && key.primary) {
                        calendar = key.id;
                        return false;
                    } else if (key.checked && key.primary === undefined) {
                        calendar = key.id;
                        return true;
                    }
                });
            }
        } else {
            this.resourceCalendarData.forEach(key => {
                if (key.checked && key.primary) {
                    calendar = key.id;
                }
            });
        }

        // remove non calendar permissions
        //var result = [];
        //for (var i = 0; i < this.resourceCalendarData.length; i++) {
        //    if (this.resourceCalendarData[i].role === 'owner' ) {
        //        result.push(this.resourceCalendarData[i]);
        //    }
        //}
        //this.resourceCalendarData = result;


        this.resourceCalendarData.sort((a, b) => {
            if (a.id === calendar) {
 return -1;
}
            //if (a.firstname > {b.firstname) { return 1; }
            return 1;
        });
    }

    predicateQueryEvents(calendarList, predicate) {
        if (calendarList != undefined) {
            calendarList.forEach((valor, indice) => {
                if (predicate) {
                    predicate = predicate.or('CalendarId', 'equal', valor.id);
                } else {
                    predicate = new Predicate('CalendarId', 'equal', valor.id);
                }
            });
        }

        if (this.scheduleObj) {
            this.scheduleObj.eventSettings.query = new Query().where(predicate);
            this.scheduleObj.refreshEvents();
        }
    }

    handleScheduleDate(args) {
        this.scheduleObj.selectedDate = args.value;
        this.scheduleObj.dataBind();
    }

    handleScheduleOpenNewEventEditor = () => {
        const endTimeDate = new Date();
        endTimeDate.setMinutes(endTimeDate.getMinutes() + 60);
        const cellData = {
            startTime: new Date(),
            endTime: endTimeDate
        };
        console.log('handleScheduleOpenNewEventEditor', this.state.schedule.openEditor);

        this.scheduleObj.openEditor(cellData, 'Add');
    }

    handleScheduleOpenEditEventEditor() {
        const eventData = this.scheduleData.find(x => x.Id == this.props.lexon.idEvent);
        this.scheduleObj.openEditor(eventData, 'Save');
    }

    sidebarCalendarList() {
       // SideBar.getCalendars();
      // this.props.getCalendars();
    }

    renderSpinner() {
        return (
            <div className='d-flex h-100 align-items-center justify-content-center'>
                <FontAwesomeIcon icon={faSpinner} spin size='3x' />
            </div>
        );
    }

    onSignout() {
        console.log('IN ... onSignout');
        const { userId, token } = this.props.lexon;
        resetDefaultAccount(userId)
            .then(result => {
                signOut();
            })
            .then(_ => {
                const urlRedirect = (token) ? `${window.URL_SELECT_ACCOUNT}/access/${token}/` : `${window.URL_SELECT_ACCOUNT}/user/${userId}/encrypt/0`;
                window.open(urlRedirect, '_self');
            });
    }

    onSignoutDisconnect() {
        console.log('IN ... onSignoutDisconnect');
        const { userId, token } = this.props.lexon;
        resetDefaultAccount(userId)
            .then(result => {
                signOutDisconnect();
            })
            .then(_ => {
                const urlRedirect = (token) ? `${window.URL_SELECT_ACCOUNT}/access/${token}/` : `${window.URL_SELECT_ACCOUNT}/user/${userId}/encrypt/0`;
                window.open(urlRedirect, '_self');
            });
    }

    setEmailTags(tag) {
        this.setState({ to2: [...tag] });
    }

    onActionBegin(args) {
        //ask for iframe
        if (args.requestType === 'toolbarItemRendering') {
            if (args.requestType === 'toolbarItemRendering') {
                const CalendarsIconItem = {
                    align: 'Right', prefixIcon: 'calendar-icon', text: '', cssClass: `${styles['calendar-icon']} e-schedule-calendar-icon`
                };
                args.items.push(CalendarsIconItem);

                if (!this.layoutIframe) {
                    const userIconItem = {
                        align: 'Right', prefixIcon: 'user-icon', text: 'Configuration', cssClass: `e-schedule-user-icon ${styles['user-icon']}`
                    };

                    args.items.push(userIconItem);
                } else {
                    const LogOutIconItem = {
                        align: 'Right', prefixIcon: 'logout-icon', text: '', cssClass: 'e-schedule-logout-icon'
                    };
                    args.items.push(LogOutIconItem);
                }
            }
        }
    }

    onEventTypeClick() {
        this.profilePopup.hide();
        this.openEventTypeView();
    }

    onImportContactsTypeClick() {
        this.profilePopup.hide();
        this.openImportConcatcsView();
    }

    /**
     * Adds an address to the list matching the id.
     *
     * @param id
     * @param address
     */
    addAddress(id, address) {
        if (address.length > 0) {
            if (id === 'to') {
                const to2 = [...this.state.to2];
                to2.push(address);
                const to = to2.join(',');
                this.setState({ to2, to });
            }
        }
    }

    /**
     * Removes the address from the under the field matching the id.
     *
     * @param id
     * @param address
     */
    removeAddress(id, address) {
        if (id === 'to') {
            const to2 = [...this.state.to2];
            to2.splice(to2.indexOf(address), 1);
            const to = to2.join(',');
            this.setState({ to2, to });
        }
    }
}

Calendar.propTypes = {

};


const mapStateToProps = state => ({
        calendarsResult: state.calendarsResult,
        lexon: state.lexon,
        email: state.login.formValues.user,
        all: state,
        currentUser: state.currentUser
    });

const mapDispatchToProps = dispatch => ({
        ...bindActionCreators(
            {
                getCalendars,
                selectCalendar,
                setDataBase,
                setGUID: setGUID,
                setSign: setSign,
                resetIdActuation,
                resetIdEvent
            },
            dispatch
        ),
    logout: () => {
            dispatch(clearUserCredentials());
            history.push('/login');
        }
    });

const mergeProps = (stateProps, dispatchProps, ownProps) =>
  Object.assign({}, stateProps, dispatchProps, ownProps, {
    reloadFolders: () =>
      dispatchProps.reloadFolders(stateProps.application.user.credentials),
    reloadMessageCache: folder =>
      dispatchProps.reloadMessageCache(stateProps.application.user, folder),
    selectFolder: folder =>
      dispatchProps.selectFolder(folder, stateProps.application.user),
    messageClicked: message =>
      dispatchProps.messageClicked(
        stateProps.application.user.credentials,
        stateProps.application.downloadedMessages,
        stateProps.receivedFolder,
        message
      ),
    setEmailShown: flag => dispatchProps.setEmailShown(flag),
    outboxEventNotified: () => dispatchProps.outboxEventNotified(),
    close: application => dispatchProps.close(stateProps.application),
    setError: (err, msg) => dispatchProps.setError(err, msg),
    resetIdActuation: () => dispatchProps.resetIdActuation(),
    resetIdEvent: () => dispatchProps.resetIdEvent(),
    setCaseFile: casefile => dispatchProps.setCaseFile(casefile)
  });

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(translate()(Calendar));


