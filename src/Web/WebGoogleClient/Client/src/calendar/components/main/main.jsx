import React, { Component, Fragment } from 'react';
import ReactDOM from "react-dom";
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import ACTIONS from '../../../actions/lexon';
import Header from '../../../components/header/Header';
import Sidebar from '../sidebar/sidebar';
import './main.scss';
import { Route, Switch, withRouter } from 'react-router-dom';
import { getCalendars } from '../sidebar/sidebar.actions';
import { selectCalendar } from '../sidebar/sidebar.actions';
import { signOut } from '../../../api/authentication';
import { signOutDisconnect } from '../../../api/authentication';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import SidebarCnn from 'react-sidebar';
import LexonComponent from '../../../apps/lexon_content';
import LexonComponentCalendar from '../../../apps/lexon_content_calendar';
import CalendarComponent from '../../../apps/calendar_content';
import { Calendars } from '../calendars/calendars';
import 'react-reflex/styles.css';
import { resetDefaultAccount } from '../../../api/accounts';
import {
    ScheduleComponent, ViewsDirective, ViewDirective,
    Day, Week, WorkWeek, Month, Agenda, Inject, Resize, DragAndDrop, DragEventArgs, ResourcesDirective, ResourceDirective,
} from '@syncfusion/ej2-react-schedule';
import { CheckBoxComponent } from '@syncfusion/ej2-react-buttons';
import { DataManager, Query, Predicate } from '@syncfusion/ej2-data';
import { ToastComponent, ToastCloseArgs } from '@syncfusion/ej2-react-notifications';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { deleteCalendar, getEventList, addCalendarEvent, deleteCalendarEvent, updateCalendarEvent, requestRecurringEvent, listCalendarList, updateCalendarList } from '../../../api/calendar-api';
import moment from 'moment';
import groupBy from "lodash/groupBy";
import orderBy from "lodash/orderBy";
import { createElement } from '@syncfusion/ej2-base';
import { TabComponent, TabItemDirective, TabItemsDirective } from '@syncfusion/ej2-react-navigations';
import ReactTagInput from "@pathofdev/react-tag-input/";
import "@pathofdev/react-tag-input/build/index.css";
import { DropDownList } from '@syncfusion/ej2-dropdowns';
import { setCulture, L10n, loadCldr, Internationalization, compile } from '@syncfusion/ej2-base';
import currencies from 'cldr-data/main/es/currencies.json';
import gregorian from 'cldr-data/main/es/ca-gregorian.json';
import numbers from 'cldr-data/main/es/numbers.json';
import timeZoneNames from 'cldr-data/main/es/timeZoneNames.json';
import numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import weekData from 'cldr-data/supplemental/weekData.json';// To load the culture based first day of week
import i18n from 'i18next';
import Reminder from "./reminder/reminder"
import { Popup } from '@syncfusion/ej2-popups';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { Eventtype } from '../eventtypes/eventtype';
import { EventsImport } from '../events-import/events'
import { getEventTypes } from "../../../api/accounts";
//import HeaderAddress from '../../../components/compose-message/header-address';
import AttendeeAddress from './attendee/attendee-address';


export class Main extends Component {
    constructor(props) {
        super(props);
        this.sidebarCalendarList = this.sidebarCalendarList.bind(this);
        this.onSignout = this.onSignout.bind(this);
        this.onSignoutDisconnect = this.onSignoutDisconnect.bind(this);
        this.onSetSidebarDocked = this.onSetSidebarDocked.bind(this);
        this.onSetSidebarOpenCalendar = this.onSetSidebarOpenCalendar.bind(this);
        this.onSetSidebarOpenLexon = this.onSetSidebarOpenLexon.bind(this);
        this.handleGetUserFromLexonConnector = this.handleGetUserFromLexonConnector.bind(this);
        this.toggleSideBar = this.toggleSideBar.bind(this);
        this.loadCalendarEvents = this.loadCalendarEvents.bind(this);
        this.handleScheduleDate = this.handleScheduleDate.bind(this);
        this.handleScheduleOpenNewEventEditor = this.handleScheduleOpenNewEventEditor.bind(this);
        this.openCalendarView = this.openCalendarView.bind(this);
        this.deleteCalendar = this.deleteCalendar.bind(this);
        this.calendarColorModify = this.calendarColorModify.bind(this);
        this.onEventRendered = this.onEventRendered.bind(this);
        this.buildEventoGoogle = this.buildEventoGoogle.bind(this);
        this.handleAddAddress = this.addAddress.bind(this);
        this.handleRemoveAddress = this.removeAddress.bind(this);
        this.onCloseDialog = this.onCloseDialog.bind(this);
        //this.onBefoireClose = this.onBefoireClose.bind(this);



        this.handleClassificatedEvent = this.handleClassificatedEvent.bind(this);
        this.handleClassificatedEventRemoved = this.handleClassificatedEventRemoved.bind(this);

        this.cancel = false;
        this.currentClassification = null;

        this.dataManager = new DataManager();
        this.defaultCalendar = undefined;
        this.scheduleData = [];
        //this.CalendarList = [];
        this.position = {X: 'Center', Y: 'Bottom'};
        this.resourceCalendarData = [];
        //this.ownerData = [];
        this.toasts = [
            {content: i18n.t("schedule.toast-processing"), cssClass: 'e-toast-black', icon: ''},
            {content: i18n.t("schedule.toast-process-complete"), cssClass: 'e-toast-black', icon: ''},
            {content: i18n.t("schedule.toast-process-error"), cssClass: 'e-toast-danger', icon: 'e-error toast-icons'}
        ]
        this.instance = new Internationalization();
        this.tabInstance = new TabComponent;
        this.layoutIframe = false;
        this.layoutIframeNewEventView = false;
        this.layoutIframeEditEventView = false;

        this.state = {
            isVisible: true,
            sidebarOpen: false,
            sidebarDocked: false,
            leftSideBar: {
                collapsed: false
            },
            hidePromptDialog: false,
            hidePromptEventTypeDialog: false,
            showPromptImportContactsDialog: false,
            calendarToEdit: undefined,
            //tagAttendess: [],
            reminders: [],
            eventType: undefined,
            isVisibility: false,
            to2: [],
            // sidebarCollapsed:false
            //externalcomponent: "<LexonComponent sidebarDocked={this.onSetSidebarDocked} />"
        };
        this.handleGetUserFromLexonConnector = this.handleGetUserFromLexonConnector.bind(
            this
        );
        // Calednar View Dialog
        this.alertButtons = [{
            // Click the footer buttons to hide the Dialog
            click: () => {
                this.setState({hideAlertDialog: false});
            },
            buttonModel: {content: 'Dismiss', isPrimary: true}
        }];
        // Calednar View Dialog
        this.confirmButton = [{
            click: () => {
                this.setState({hideConfirmDialog: false});
            },
            buttonModel: {content: 'Yes', isPrimary: true}
        },
            {
                click: () => {
                    this.setState({hideConfirmDialog: false});
                },
                buttonModel: {content: 'No'}
            }];
        // Calednar View Dialog
        this.promptButtons = [{
            click: () => {
                this.setState({hidePromptDialog: false});
            },
            buttonModel: {content: 'Accept', isPrimary: true}
        },
            {
                click: () => {
                    this.setState({hidePromptDialog: false});
                },
                buttonModel: {content: 'Cancel'}
            }];
        // Calednar View Dialog
        this.animationSettings = {effect: 'None'};

        // Syncfusion omponent translation
        this.setGlobalization();

        this.tabObj = undefined;
        this.drowDownListEventType = undefined;
        this.drowDownListVisibility = undefined;
        this.selectedEvent = undefined;


        // to change when api would be ready
        this.eventTypeDataSource =
            [
                //{ text: 'Profesional', id: '1', backgroundColor:'#001978' },
                //{ text: 'Ceremonia', id: '2', backgroundColor: '#FF5733' },
                //{ text: 'Conferencia', id: '3', backgroundColor: '#FF33E3' },
                //{ text: 'Cursos', id: '4', backgroundColor: '#33FF76' },
                //{ text: 'Reunion', id: '5', backgroundColor: '#F9FF33' },
                //{ text: 'Presentación', id: '6', backgroundColor: '#F3D59A' },
                //{ text: 'Seminarios', id: '7', backgroundColor: '#9AF3EA' },
                //{ text: 'Aprendizaje', id: '7', backgroundColor: '#0F6259' },
                //{ text: 'Talleres', id: '8', backgroundColor: '#F8CBE9' },
                //{ text: 'Otros', id: '9', backgroundColor: '#F5F3F4' },
            ];

        this.items = [
            {
                text: 'Dashboard',
                iconCss: 'e-ddb-icons e-dashboard'
            },
            {
                text: 'Notifications',
                iconCss: 'e-ddb-icons e-notifications',
            },
            {
                text: 'User Settings',
                iconCss: 'e-ddb-icons e-settings',
            },
            {
                text: 'Log Out',
                iconCss: 'e-ddb-icons e-logout'
            }
        ];

        this.TokensFlows();
    }



    onCloseDialog() {
        this.LoadCalendarList(false)


        window.top.postMessage(
            JSON.stringify({
                idEvent:undefined,
                actionCancelled: true,
                selectedDate: undefined
            }),
            window.URL_LEXON
        );

    }

    async handleClassificatedEvent(event) {
        const googleEvent = this.buildEventoGoogle(event.detail);
        let resp = await updateCalendarEvent(event.detail.CalendarId, event.detail.Id, googleEvent);
        this.currentClassification = event.detail.LexonClassification;
    }

    async handleClassificatedEventRemoved(event) {
        event.detail.LexonClassification = undefined;
        const googleEvent = this.buildEventoGoogle(event.detail);
        let resp = await updateCalendarEvent(event.detail.CalendarId, event.detail.Id, googleEvent);
        this.currentClassification = undefined;
    }

    async setGlobalization() {
        if (window.navigator.language.includes("es-")
            || (window.navigator.language == "es")
            || (window.navigator.language == "ca")
            || (window.navigator.language == "ga")
            || (window.navigator.language == "eu")) {
            loadCldr(currencies, numberingSystems, gregorian, numbers, timeZoneNames, weekData);
            const data = await import('../../syncfusion-resources/calendar-es.json')
            setCulture('es');
            L10n.load(data);
        }
    }


    TokensFlows() {
        if (window != window.top)
        {
            this.layoutIframe = true;
        }

        if (this.props.lexon.idActuation != undefined & this.props.lexon.idEvent != null) {
            this.layoutIframeEditEventView = true
        }
        else if (this.props.lexon.idActuation != undefined & this.props.lexon.idEvent == null) {
            this.layoutIframeNewEventView = true
        }

    }

    convertUnicode(input) {
        return input.replace(/\\u(\w{4,4})/g, function (a, b) {
            var charcode = parseInt(b, 16);
            return String.fromCharCode(charcode);
        });
    }

    calendarColorModify(calendarId, color) {

        let calendarData = {
            "backgroundColor": color,
            "foregroundColor": '#ffffff'
        }


        updateCalendarList(calendarId, calendarData)
            .then(result => {
                console.log(result)
                this.toastObj.hide('All');
                this.toastObj.showProgressBar = false
                this.toastObj.show(this.toasts[1]);
                this.LoadCalendarList(true)
                this.sidebarCalendarList();

            })
            .catch(error => {
                console.log('error ->', error);
                this.toastObj.showProgressBar = false
                this.toastObj.hide('All');
                this.toastObj.show(this.toasts[2]);
            });

    }

    deleteCalendar(args) {

        this.toastObj.show(this.toasts[0]);
        const calendarid = args.currentTarget.id

        deleteCalendar(args.currentTarget.id)
            .then(result => {
                this.LoadCalendarList(true)
                this.sidebarCalendarList();

                this.scheduleData = this.scheduleData.filter(function (obj) {
                    return obj.CalendarId !== calendarid;
                });
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
        //if (args.target.innerHTML.toLowerCase() == 'alert') {
        //    this.setState({ hideAlertDialog: true });
        //}
        //else if (args.target.innerHTML.toLowerCase() == 'confirm') {
        //    this.setState({ hideConfirmDialog: true });
        //}
        //else if (args.target.innerHTML.toLowerCase() == 'prompt')

        //this.promptDialogInstance.show(true);

        let calendarId = ""
        if (args != undefined)
            calendarId = args.currentTarget.id
        this.setState(
            {
                hidePromptDialog: true, calendarToEdit: calendarId
            });
    }
    // Calednar View Dialog
    dialogClose(args) {
        if (args == undefined) {
            this.LoadCalendarList(true)
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
        //if (args == undefined) {
        //    this.toastObj.show(this.toasts[1]);
        //}
        this.setState({
            showPromptImportContactsDialog: false
        });
    }


    toastCusAnimation = {
        hide: { duration: '1' },
        show: { duration: '200' }
    };

    toastPreventDuplicate(e) {
        let toastEle = e.element;
        let toasts = e.toastObj.element.children;
        for (let i = 0; i < toasts.length; i++) {
            let toastTitle = toasts[i].querySelector('.e-toast-title');
            let toastMessage = toasts[i].querySelector('.e-toast-message');
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

    text_truncate (str, length, ending) {
        if (length == null) {
            length = 10;
        }
        if (ending == null) {
            ending = '...';
        }
        if (str.length > length) {
            return str.substring(0, length - ending.length) + ending;
        } else {
            return str;
        }
    };

    eventTemplate(props) {
        let colorExist = false;
        if (props.EventType != undefined) {
            colorExist = true
        }
        let subjectStr = props.Subject;
        if (props.Subject != undefined) {
            subjectStr = this.text_truncate(props.Subject, 15)
        }
        else {
            subjectStr = i18n.t("schedule.notitle")
        }

        return (
            <div Style="width: 98%;">
                {/*  <div className="image"><img width="16" height="16" src={"assets/img/" + props.ImageName + ".png"} /> {props.Subject}</div>*/}
                <div className="image">
                    <div className='eventicon'>

                        { props.LexonClassification && <img width="16" height="16" src={"assets/img/" + props.ImageName + ".png"} /> }
                        {subjectStr}
                        {colorExist ? (
                            <span Style={`background-color: ${props.EventType.color} ;  margin-top: 3px`} className='dot floatleft'></span>
                        ) : (
                            ''
                        )}
                    </div>
                </div>

                {/* <div className="subject">{props.Subject}</div>
               <div className="time">Time: {this.getTimeString(props.StartTime)} - {this.getTimeString(props.EndTime)}</div>*/}

            </div>);
    }

    eventTemplateAgendaView(props) {
        let colorExist = false;
        if (props.EventType != undefined) {
            colorExist = true
        }
        let subjectStr = props.Subject;
        if (props.Subject != undefined) {
            props.Subject = this.text_truncate(props.Subject, 100)
        }
        else {
            subjectStr = i18n.t("schedule.notitle")
        }

        //var eventstart = new Date('August 19, 1975 23:15:30 GMT+00:00');

        //console.log(event.toLocaleTimeString('en-US'));

        return (
            <div >
                {/*  <div className="image"><img width="16" height="16" src={"assets/img/" + props.ImageName + ".png"} /> {props.Subject}</div>*/}
                <div className="image">
                    <span className='eventicon truncate'>
                        <img width="16" height="16" src={"assets/img/" + "lefebvre" + ".png"} />
                        {colorExist ? (
                            <span Style={`background-color: ${props.EventType.color} ;  margin-top: 3px`} className='dot dotagenda'></span>
                        ) : (
                            <span Style={`background-color: ${'#FFFFFF'} ;  margin-top: 3px`} className='dot dotagenda'></span>
                        )}

                        {props.IsAllDay ? (
                            <span>todo el día</span>
                        ) : (

                            <span> {props.StartTime.toLocaleTimeString('es-ES')} - {props.EndTime.toLocaleTimeString('es-ES')}</span>
                        )}
                    </span>
                    <span className='space' > {subjectStr} </span>

                </div>

                {/* <div className="subject">{props.Subject}</div>
               <div className="time">Time: {this.getTimeString(props.StartTime)} - {this.getTimeString(props.EndTime)}</div>*/}

            </div>);
    }


    toggleSideBar() {
        const toggleCollapsed = !this.state.leftSideBar.collapsed;
        this.setState({
            leftSideBar: {
                collapsed: toggleCollapsed,
            },
        });
    }

    onDataBinding(e, calendarId) {
        let items = this.dataManager.items;
        this.scheduleData = this.scheduleData.filter( i => i.CalendarId !== calendarId);
        if (items.length > 0) {
            for (let i = 0; i < items.length; i++) {
                let event = items[i];
                if (event.status === 'cancelled') {
                    var dateStartTime = new Date(event.originalStartTime.dateTime);
                    var dateString = moment(dateStartTime).seconds(0).toISOString().split('.')[0] + "Z";
                    var ExcRecurenceDate = dateString.replace(/[:.-]/g, "");
                    var ParentscheduleException = "";
                    var coma = ""
                    if (this.scheduleData.find(x => x.Id == event.recurringEventId).RecurrenceException != undefined) {
                        ParentscheduleException = this.scheduleData.find(x => x.Id == event.recurringEventId).RecurrenceException;
                        coma = ","
                    }
                    this.scheduleData.find(x => x.Id == event.recurringEventId).RecurrenceException = ParentscheduleException + coma + ExcRecurenceDate
                    continue;
                }

                //managing all day from googe calendar issues
                if (event.end.date) {
                    let date1 = new Date(event.start.date);
                    let date2 = new Date(event.end.date);
                    const diffTime = Math.abs(date1 - date2);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays == 1) {
                        date2.setDate(date2.getDate() - 1)
                        event.end.date = date2.toISOString();
                    }
                }

                let when = event.start.dateTime;
                let start = event.start.dateTime;
                let end = event.end.dateTime;
                if (!when) {
                    when = event.start.date;
                    start = event.start.date;
                    end = event.end.date;
                }


                // Recurrence
                let recurrenceRule
                if (event.recurrence != undefined) {
                    recurrenceRule = event.recurrence[0].replace('RRULE:', '');
                }

                // Attendees
                let attendees = []
                if (event.attendees != undefined) {
                    attendees = event.attendees;
                }
                else {
                    attendees = undefined;
                }

                // EventType
                let eventType = [];
                let lexonClassification = null;
                if (event.extendedProperties != undefined) {
                    eventType.name = event.extendedProperties.private.eventTypeName;
                    eventType.id = event.extendedProperties.private.eventTypeId;
                    eventType.color = event.extendedProperties.private.eventTypeColor;
                    lexonClassification = event.extendedProperties.private.lexonClassification;
                }

                let reminders = []
                if (event.reminders != undefined) {
                    reminders = event.reminders.overrides;
                }


                this.scheduleData.push({
                    Id: event.id,
                    CalendarId: calendarId,
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
                    LexonClassification: lexonClassification
                });
            }
        }
        e.result = this.scheduleData;
    }



    sendMessagePutUser(user) {
        const { selectedMessages, googleUser } = this.props;

        window.dispatchEvent(
            new CustomEvent('PutUserFromLexonConnector', {
                detail: {
                    user,
                    selectedMessages: this.selectedEvent?[ { ...this.selectedEvent, Guid: this.selectedEvent.Id } ]:[],
                    idCaseFile: this.props.lexon.idCaseFile,
                    bbdd: this.props.lexon.bbdd,
                    idCompany: this.props.lexon.idCompany,
                    provider: this.props.lexon.provider,
                    account: googleUser.getBasicProfile().getEmail(),
                    app: this.state.showPromptImportContactsDialog?'calendar:import':'calendar',
                    env: window.currentUser?window.currentUser.env : null
                }
            })
        );
    }

    handleGetUserFromLexonConnector(event) {
        // const { userId } = this.props.lexon;
        const userId = 'E1621396'
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
            this.forceUpdate()
        });
    }

    onSetSidebarOpenLexon(open) {
        this.setState({
            sidebarComponent: (
                <LexonComponent sidebarDocked={this.onSetSidebarDocked} />
            )
        });
        this.setState({ sidebarDocked: open }, () => {
            this.forceUpdate()
        });
    }

    onSetSidebarDocked(open) {
        this.setState({ sidebarDocked: open });
    }

    componentDidMount() {

        if (this.layoutIframe) {
            this.setState({ leftSideBar: { collapsed: true } })
        }

        window.addEventListener(
            'EventClassified',
            this.handleClassificatedEvent
        );

        window.addEventListener(
            'RemoveSelectedEvent',
            this.handleClassificatedEventRemoved
        );

        window.addEventListener(
            'GetUserFromLexonConnector',
            this.handleGetUserFromLexonConnector
        );
        window.addEventListener(
            'GetUserFromCentinelaConnector',
            this.handleGetUserFromCentinelaConnector
        );

        window.addEventListener('RemoveSelectedDocument', (event) => {
            this.props.deleteMessage(event.detail.id);
            dispatchEvent(
                new CustomEvent('Checkclick', {
                    detail: {
                        id: event.detail.id,
                        extMessageId: event.detail.id,
                        name: event.detail.id,
                        subject: event.detail.subject,
                        sentDateTime: event.detail.sentDateTime,
                        folder: event.detail.folder,
                        provider: 'GOOGLE',
                        account: this.props.lexon.account,
                        chkselected: false,
                    },
                })
            );
        });



        this.sidebarCalendarList();

        //Firefox load is slow and need to take into account wait more time to be ready
        let value = 100;
        if (navigator.userAgent.toLowerCase().indexOf('firefox') > 0) {
            value = 250;
        }

        let obj = this;
        setTimeout(function () {
            obj.LoadCalendarList();
            obj.getlistEventTypes()


            // New event is called
            if (obj.layoutIframeNewEventView) {
                setTimeout(function () {
                    obj.handleScheduleOpenNewEventEditor()
                }, 1000);
            }

            // Edit event is called
            if (obj.layoutIframeEditEventView) {
                setTimeout(function () {
                    obj.handleScheduleOpenEditEventEditor()
                }, 1000);
            }

        }, value);



        //if (this.layoutIframe) {
        //    setTimeout(function () {
        //        obj.handleScheduleOpenEditor()
        //    }, 1000);
        //}
    }

    onDataBindingEventTypeList(items) {
        this.eventTypeDataSource = [];
        if (items.length > 0) {
            for (let i = 0; i < items.length; i++) {
                let evt = items[i];
                this.eventTypeDataSource.push({
                    text: evt.name,
                    id: evt.idEvent,
                    backgroundColor: evt.color,
                });
            }
        }
        if (this.drowDownListEventType != undefined) {
            this.drowDownListEventType.dataSource = this.eventTypeDataSource;
        }

    }

    getlistEventTypes() {


        let email = this.props.googleUser.getBasicProfile().getEmail();

        getEventTypes(email)
            .then(result => {
                this.onDataBindingEventTypeList(result.data.eventTypes)
            })
            .catch(error => {
                console.log('error ->', error);
            });
    }


    LoadCalendarList(DisableloadSchedule) {
        this.resourceCalendarData = []
        listCalendarList()
            .then(result => {
                this.resourceCalendarData = orderBy(result.items, "primary");
                this.resourceCalendarData.find(x => x.id == this.resourceCalendarData[0].id).checked = true;
                if (!DisableloadSchedule) {
                    this.loadCalendarEvents(this.resourceCalendarData[0].id, true);
                    this.scheduleObj.refresh();
                }

            })
            .catch(error => {
                console.log('error ->', error);
            });
    }

    componentWillUnmount() {
        window.removeEventListener(
            'EventClassified',
            this.handleClassificatedEvent
        );

        window.removeEventListener(
            'RemoveSelectedEvent',
            this.handleClassificatedEventRemoved
        );

        window.removeEventListener(
            'GetUserFromLexonConnector',
            this.handleGetUserFromLexonConnector
        );
        window.removeEventListener(
            'GetUserFromCentinelaConnector',
            this.handleGetUserFromCentinelaConnector
        );
    }



    buildEventoGoogle(values) {
        //Event basic data
        var event = {
            'summary': values.Subject,
            'location': values.Location,
            'description': values.Description,

            'start': {
                'dateTime': values.StartTime,
                'timeZone': 'Europe/Madrid',
            },
            'end': {
                'dateTime': values.EndTime,
                'timeZone': 'Europe/Madrid',
            },
            // 'visibility': values.Visibility ? 'private' : 'normal'
        }

        //event Type
        if (values.EventType != undefined && values.EventType != null && values.EventType.length > 0) {
            let item;
            if (values.EventType.name != undefined) {
                item = this.eventTypeDataSource.find(x => x.text == values.EventType.name)
            }
            else {
                item = this.eventTypeDataSource.find(x => x.text == values.EventType)
            }
            event.extendedProperties = {
                'private': {
                    'eventTypeName': item.text,
                    'eventTypeId': item.id,
                    'eventTypeColor': item.backgroundColor,
                },
            }
        }

        if(values.LexonClassification != undefined) {
            const properties = {
                ...(event.extendedProperties? event.extendedProperties.private || {} : {}),
                'lexonClassification': '' + values.LexonClassification
            }

            event.extendedProperties = {
                ...event.extendedProperties,
                private: properties
            }
        }


        //"extendedProperties": {
        //    "private": {
        //        'eventType': '1'
        //    },
        //},

        //Recurrence
        if (values.RecurrenceRule != undefined) { event.recurrence = ['RRULE:' + values.RecurrenceRule] };

        //Atendees
        let arr = this.state.to2
        let ateendeeObj = [];
        if (arr.length > 0) {
            Object.keys(arr).forEach(function (key) {
                ateendeeObj.push({ 'email': arr[key] });
            });
        }
        event.attendees = ateendeeObj;

        //Reminders

        let reminders = []
        let arrR = this.remObj.listviewInstance.dataSource;
        if (arrR.length > 0) {

            event.reminders = {
                'useDefault': false,
                'overrides': [],
            }
            Object.keys(arrR).forEach(function (key) {
                event.reminders.overrides.push({
                    method: arrR[key].title,
                    minutes: arrR[key].minutesvalue,
                });
            });
        }

        return event
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
        let a = args
    }

    tabContent() {
        return (
            <LexonComponentCalendar />
        );
    }

    selectingTab(args) {
        var formElement = this.scheduleObj.eventWindow.element.querySelector('.e-schedule-form');
        var validator = (formElement).ej2_instances[0];
        validator.validate();

        if (validator.errorRules.length <= 0) {
            this.cancel = false;
            if (this.tabObj.selectingID == 1 && this.scheduleObj.eventWindow.eventData.Id == undefined) {
                // this.tabObj.refresh()
                let id = this.scheduleObj.eventWindow.eventData.Id;
                if (id == undefined) {
                    this.scheduleObj.addEvent(this.scheduleObj.eventWindow.getEventDataFromEditor().eventData);
                    //the id to pass to connector is = this.scheduleObj.eventWindow.eventData.Id);
                    this.scheduleObj.eventWindow.eventData.typeEvent = "lexon";
                }
                else {
                    this.scheduleObj.saveEvent(this.scheduleObj.eventWindow.eventData);
                }
            }
            //else if (this.tabObj.selectingID == 1 && this.scheduleObj.eventWindow.eventData.Id != undefined){
            //    this.scheduleObj.saveEvent(this.scheduleObj.eventWindow.eventData);
            //}
        }
        else {
            args.cancel = true

        }
    }

    eventTypeTemplate(data) {
        return (
            <div className="typeitem">
                <span> <span Style={`background-color: ${data.backgroundColor}`} className='dot'></span>  <span className='name'>{data.text}</span></span>
            </div>
        );
    }

    ToogleCalendarResourceDirective(args) {
        if (args.data.Id != undefined) {
            console.log(this.scheduleObj.resourceCollection[0].cssClassField)
            ////  this.scheduleObj.resourceCollection[0].cssClassField = "hidden"
            var cal = document.getElementsByClassName("e-CalendarId-container");
            cal[0].classList.add('disabledbutton');

        }
        else {
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
        //if (this.layoutIframe) {
        //    args.cancel = true;
        //}
        var DateMessage = args.data.startTime
        window.top.postMessage(
            JSON.stringify({
                idEvent: args.data.Id,
                actionCancelled:false,
                selectedDate: DateMessage
            }),
            window.URL_LEXON
        );

        //Not allow to change calendar property on update events
        this.ToogleCalendarResourceDirective(args);

        //Not allow to change calendar property on update events
        if (args.data.Id != undefined) {
            console.log(this.scheduleObj.resourceCollection[0].cssClassField)
            ////  this.scheduleObj.resourceCollection[0].cssClassField = "hidden"
            var cal = document.getElementsByClassName("e-CalendarId-container");
            cal[0].classList.add('disabledbutton');

        }
        else {
            var cal = document.getElementsByClassName("e-CalendarId-container");
            cal[0].classList.remove('disabledbutton');
        }

        // default values for EventType coming from event args
        if (args.data.EventType != undefined) {
            this.setState({ eventType: args.data.EventType.name })
            if (this.drowDownListEventType != undefined) {
                this.drowDownListEventType.value = args.data.EventType.name
            }
        }
        else {
            this.setState({ eventType: undefined })
            //this.drowDownListEventType.value = undefined;
        }


        // default values for Atendees coming from event args
        if (args.data.Attendees != undefined) {
            //const peopleArray = Object.keys(args.data.Attendees).map(i => args.data.Attendees[i])
            var arr = [];
            Object.keys(args.data.Attendees).forEach(function (key) {
                arr.push(args.data.Attendees[key].email);
            });
            this.setState({ to2: arr })
        }
        else {
            this.setState({ to2: [] })
        }

        // default values for Visibility coming from event args
        if(args.data.Visibility != undefined) {
            const isVisibility = args.data.Visibility == 'private' ? true : false;
            this.setState({ isVisibility: isVisibility });
            if (this.drowDownListVisibility != undefined) {
                this.drowDownListVisibility.checked = isVisibility;
            }
        }

        // default values for Reminders coming from event args

        if (args.data.Reminders != undefined) {
            //const peopleArray = Object.keys(args.data.Attendees).map(i => args.data.Attendees[i])
            var arr = [];
            Object.keys(args.data.Reminders).forEach(function (key) {
                //arr.push(args.data.Reminders[key]);
                arr.push({
                    title: args.data.Reminders[key].method,
                    value: args.data.Reminders[key].minutes,
                    minutesvalue: args.data.Reminders[key].minutes,
                    id: 'n',
                    icon: "delete-icon"
                });
            });
            this.setState({ reminders: arr })
        }
        else {
            this.setState({ reminders: [] })
        }



        if (args.type === 'QuickInfo') {

            if (this.layoutIframe) {
                var buttonElementEdit = ".e-event-popup .e-edit";
                var removeButton = document.querySelector(buttonElementEdit);
                if (removeButton != undefined) {
                    removeButton.disabled = true;
                }

                if (args.data.Id === undefined) {
                    args.cancel = true
                }
                else {
                    var content = document.getElementsByClassName("e-popup-content");
                    content[0].classList.add('hidden');
                }
            }

            //Not allow to update events of not owner or writer calendar permissions
            let calendarRole = this.resourceCalendarData.find(x => x.id == args.data.CalendarId).accessRole
            if (calendarRole != "owner" &&
                calendarRole != "writer") {

                var buttonElementRemove = args.type === "QuickInfo" ? ".e-event-popup .e-delete" : ".e-schedule-dialog .e-event-delete";
                var removeButton = document.querySelector(buttonElementRemove);
                if (removeButton != undefined) {
                    removeButton.disabled = true;
                }

            }


            var formElement = args.element.querySelector('.e-schedule-form');
            if (formElement != null) {
                var validator = (formElement).ej2_instances[0];
                validator.addRules('Subject', { required: [true, i18n.t("schedule.validator-required")] });
            }

        }
        if (args.type === 'Editor') {
            this.currentClassification = args.data.LexonClassification;

            setTimeout(()=>{
                const dlg = document.getElementById("schedule_dialog_wrapper")
                let btn = dlg.getElementsByClassName('e-dlg-closeicon-btn');
                if(btn && btn.length > 0) {
                    btn[0].onclick = this.onCloseDialog;
                }

                btn = dlg.getElementsByClassName('e-event-cancel');
                if(btn && btn.length > 0) {
                    btn[0].onclick = this.onCloseDialog;
                }

            }, 1000);

            if (this.layoutIframe & this.layoutIframeNewEventView || this.layoutIframeEditEventView ) {
                var head = document.getElementById("schedule_dialog_wrapper_dialog-header");
                head.classList.add('hidden');
            }


            this.selectedEvent = {...args.data};

            var editButton = document.querySelector('.e-event-delete');
            editButton.disabled = false;

            var editButtonSave = document.querySelector('.e-event-save');
            editButtonSave.hidden = false;

            if (args.data.Id != undefined) {
                let calendarRole = this.resourceCalendarData.find(x => x.id == args.data.CalendarId).accessRole
                if (calendarRole != "owner" &&
                    calendarRole != "writer") {
                    var editButton = document.querySelector('.e-event-delete');
                    editButton.disabled = true;

                    var editButtonSave = document.querySelector('.e-event-save');
                    editButtonSave.hidden= true;
                }
            }


            var dialogObj = args.element.ej2_instances[0];
            dialogObj.buttons[1].buttonModel.isPrimary = false;
            args.element.style.width = "900px";
            args.element.style.height = "800px";

            var formElement = args.element.querySelector('.e-schedule-form');
            if (formElement != null) {
                var validator = (formElement).ej2_instances[0];
                validator.addRules('Subject', { required: [true, i18n.t("schedule.validator-required")] });
            }

            // Create required custom elements in initial time
            if (!args.element.querySelector('.custom-field-row')) {
                let row = createElement('div', { className: 'custom-field-row' });
                let rowAttendes = createElement('div', { className: 'custom-field-row' });
                let rowReminders = createElement('div', { className: 'custom-field-row' });
                let formElement = args.element.querySelector('.e-schedule-form');

                formElement.firstChild.insertBefore(rowAttendes, formElement.firstChild.firstChild);
                formElement.firstChild.insertBefore(row, formElement.lastChild.lastChild);
                formElement.firstChild.insertBefore(rowReminders, formElement.lastChild.lastChild);


                // Adding event type element
                let containerEventType = createElement('div', { className: 'custom-field-container' });
                row.appendChild(containerEventType);
                let inputEle = createElement('input', {
                    className: 'e-field', attrs: { name: 'EventType' }
                });
                containerEventType.appendChild(inputEle);

                this.drowDownListEventType = new DropDownList({
                    itemTemplate: this.eventTypeTemplate = this.eventTypeTemplate.bind(this),
                    dataSource: this.eventTypeDataSource,
                    value: this.state.eventType,
                    floatLabelType: 'Always', placeholder: i18n.t("schedule.eventtype")
                });
                this.drowDownListEventType.appendTo(inputEle);
                inputEle.setAttribute('name', 'EventType');


                // Adding visibility element
                let containerVisibility = createElement('div', { className: 'custom-field-container' });
                row.appendChild(containerVisibility);
                let inputVisibility = createElement('input', {
                    className: 'e-field', attrs: { name: 'Visibility' }
                });
                containerVisibility.appendChild(inputVisibility);

                this.drowDownListVisibility = new CheckBoxComponent({
                    value: this.state.isVisibility,
                    label: i18n.t("schedule.visibility"),
                    checked: this.state.isVisibility
                });

                this.drowDownListVisibility.appendTo(inputVisibility);
                inputVisibility.setAttribute('name', 'Visibility');



                // Adding attendees2 tag element
                let containerTab2 = createElement('div', { className: 'custom-field-container' });
                rowAttendes.appendChild(containerTab2);
                var nodeA = ReactDOM.findDOMNode(this.tagObjHead);
                containerTab2.appendChild(nodeA);

                //// Adding attendees tag element
                //let containerTab = createElement('div', { className: 'custom-field-container' });
                //rowAttendes.appendChild(containerTab);
                //var nodeA = ReactDOM.findDOMNode(this.tagObj);
                //containerTab.appendChild(nodeA);

                // Adding reminder element
                let containerRem = createElement('div', { className: 'custom-field-container' });
                rowReminders.appendChild(containerRem);
                var nodeR = ReactDOM.findDOMNode(this.remObj);
                containerRem.appendChild(nodeR);

            }

            // if from iframe is requested a new event
            if (!this.layoutIframeNewEventView) {

                let TabContainer = args.element.querySelector('.custom-tab-row');
                if (TabContainer == null) {
                    if (args.element.querySelector('.e-dlg-content')) {
                        let formContainer = args.element.querySelector('.e-schedule-form');
                        let Element = args.element.querySelector('.e-dlg-content');
                        let row = createElement('div', { className: 'custom-tab-row' });
                        Element.firstChild.insertBefore(row, Element.firstChild.firstChild);
                        this.tabObj = new TabComponent({
                            items: [
                                { header: { text: 'EVENT', iconCss: 'e-twitter', iconPosition: 'right' }, content: formContainer },
                                { header: { text: 'LEX-ON', iconCss: 'e-twitter', iconPosition: 'right' }, content: this.tabContent },
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
                }
                else {
                    console.log(this.tabInstance);
                    this.tabObj.selectedItem = 0;
                    this.tabObj.refresh();
                    //}
                }
            }

        }

    }

    addLogOutButton(args) {
        let scheduleElement = document.getElementById('schedule');
        if (args.requestType === 'toolBarItemRendered') {
            let logoutIconEle = scheduleElement.querySelector('.e-schedule-logout-icon');
            logoutIconEle.onclick = () => {
                // alert('logout');
                signOut();
                window.location.reload();
            };
        }
        let logoutContentEle = createElement('div', {
            className: 'e-profile-wrapper'
        });

        scheduleElement.parentElement.appendChild(logoutContentEle);


    }




    addCalendarsButton(args) {
        let scheduleElement = document.getElementById('schedule');
        if (args.requestType === 'toolBarItemRendered') {
            let calendarIconEle = scheduleElement.querySelector('.e-schedule-calendar-icon');
            calendarIconEle.onclick = () => {
                this.toggleSideBar()
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
        let scheduleElement = document.getElementById('schedule');
        if (args.requestType === 'toolBarItemRendered') {
            let userIconEle = scheduleElement.querySelector('.e-schedule-user-icon');
            userIconEle.onclick = () => {
                this.profilePopup.relateTo = userIconEle;
                this.profilePopup.dataBind();
                if (this.profilePopup.element.classList.contains('e-popup-close')) {
                    this.profilePopup.show();
                }
                else {
                    this.profilePopup.hide();
                }
            };
        }
        let userContentEle = createElement('div', {
            className: 'e-profile-wrapper'
        });

        scheduleElement.parentElement.appendChild(userContentEle);
        let userIconEle = scheduleElement.querySelector('.e-schedule-user-icon');
        let output = this.buttonEventTypeObj;
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
                }
                else {
                    this.addLogOutButton(args);

                }
                this.addCalendarsButton(args);
                break;

            case 'eventChanged':
                let idEvent;
                if (args.data[0] != undefined) {
                    idEvent = args.data[0].Id
                }
                else {
                    idEvent = args.data.Id
                }

                var desc = this.scheduleObj.dataModule.dataManager.dataSource.json.find(function (e) {
                    return e.Id == idEvent
                })

                if (desc) {

                    //reset reminders
                    desc.Reminders = [];

                    //Update Reminders
                    let arrR = this.remObj.listviewInstance.dataSource;
                    if (arrR.length > 0) {
                        Object.keys(arrR).forEach(function (key) {
                            desc.Reminders.push({
                                method: arrR[key].title,
                                minutes: arrR[key].value,
                            });

                        });
                    }

                    //reset attendess
                    desc.Attendees = [];

                    //Update Attendess
                    let att = this.state.to2;
                    if (att != undefined) {
                        Object.keys(att).forEach(function (key) {
                            desc.Attendees.push({ 'email': att[key] });
                        });
                    }

                    //update eventType
                    //Convert dropdown eventType in eventtype object to paint into schedule event
                    if (desc.EventType != undefined && desc.EventType != null) {
                        let item;
                        item = this.eventTypeDataSource.find(x => x.text == desc.EventType)
                        // create EventType with structure
                        let eventType = [];
                        if (item != undefined) {
                            eventType.name = item.text;
                            eventType.id = item.id;
                            eventType.color = item.backgroundColor;
                            desc.EventType = eventType;
                        }
                    }

                    desc.LexonClassification = this.currentClassification;
                }

                //Update the schedule datasource
                this.scheduleObj.dataModule.dataManager.update();
                args.data.LexonClassification = this.currentClassification;

                //update the Event to call the api
                event = this.buildEventoGoogle(args.data);

                let itemToModify = args.data.Id
                //let itemToModify = desc.CalendarId
                let calendarToModify = args.data.CalendarId
                if (args.data.occurrence != undefined) {

                    //call function to remvove event from serie
                    let eventItemToModify
                    var singleEventToRemove = args.changedRecords[0].RecurrenceException.split(",");
                    if (singleEventToRemove.length > 0) {
                        eventItemToModify = args.data.parent.Id + '_' + singleEventToRemove[singleEventToRemove.length - 1];
                    }
                    else {
                        eventItemToModify = args.data.parent.Id + '_' + singleEventToRemove[0];
                    }
                    this.deleteCalendarEventCRUD(args.data.parent.CalendarId, eventItemToModify, true);

                    //call function to add new single event out of the serie
                    args.addedRecords[0].RecurrenceRule = undefined
                    let eventOcurrence = this.buildEventoGoogle(args.addedRecords[0]);
                    this.addCalendarEventCRUD(args.data.parent.CalendarId, eventOcurrence);
                    break

                }
                if (args.changedRecords[0] != undefined) {
                    calendarToModify = args.changedRecords[0].CalendarId
                    args.changedRecords[0].LexonClassification = this.currentClassification;
                    event = this.buildEventoGoogle(args.changedRecords[0]);
                }

                //call function to update event
                this.updateCalendarEventCRUD(calendarToModify, itemToModify, event);

                break;

            case 'eventCreated':

                event = this.buildEventoGoogle(args.data[0]);

                // if the calendar is not checked remove from current view
                if (!this.resourceCalendarData.find(x => x.id == args.data[0].CalendarId).checked) {
                    delete this.scheduleObj.dataModule.dataManager.dataSource.json.splice(-1, 1);
                }

                addCalendarEvent(args.data[0].CalendarId, event)
                    .then(result => {

                        // refresh event data
                        if (this.scheduleObj.eventWindow.eventData != undefined) {
                            this.scheduleObj.eventWindow.eventData.Id = result.id;
                        }



                        // this.scheduleObj.eventWindow.resetForm();
                        args.data[0].Id = result.id;
                        args.data[0].ImageName = "icon-lefebvre-bl";
                        args.data[0].Attendees = result.attendees;
                        //args.data[0].ImageName = "lefebvre";
                        this.setState({ to2: [] })

                        args.data[0].Reminders = result.reminders.overrides;

                        //Convert dropdown eventType in eventtype object to paint into schedule event
                        if (args.data[0].EventType != undefined && args.data[0].EventType != null) {
                            let item;
                            item = this.eventTypeDataSource.find(x => x.text == args.data[0].EventType)
                            // create EventType with structure
                            let eventType = [];
                            if (item != undefined) {
                                eventType.name = item.text;
                                eventType.id = item.id;
                                eventType.color = item.backgroundColor;
                                args.data[0].EventType = eventType;
                            }
                        }

                        this.toastObj.show(this.toasts[1]);
                    })
                    .catch(error => {
                        if (error.result != undefined) {
                            if (error.result.error.errors[0] != undefined) {
                                if (error.result.error.errors[0].reason == "requiredAccessLevel") {
                                    this.toastObj.show({ content: error.result.error.errors[0].message, cssClass: 'e-toast-danger', icon: '' });
                                    console.log('error ->', error);
                                    delete this.scheduleObj.dataModule.dataManager.dataSource.json.splice(-1, 1);
                                    this.scheduleObj.refreshEvents();
                                    return;
                                }
                            }
                            else {
                                this.toastObj.show(this.toasts[2]);
                                console.log('error ->', error);
                            }
                        }
                        else {
                            this.toastObj.show(this.toasts[2]);
                            console.log('error ->', error);
                        }
                    })

                break;

            case 'eventRemoved':
                //call function to delete event
                let item = args.data[0].Id
                let calendarFromRemove = args.data[0].CalendarId
                if (args.data[0].occurrence != undefined) {
                    var d = new Date(args.data[0].occurrence.StartTime);
                    var dateString = moment(d).seconds(0).toISOString().split('.')[0] + "Z";
                    var ExcRecurenceDate = dateString.replace(/[:.-]/g, "");
                    item = args.data[0].parent.Id + '_' + ExcRecurenceDate;
                    calendarFromRemove = args.changedRecords[0].CalendarId
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

    addCalendarEventCRUD(CalendarId, event, hiddeMessage) {
        addCalendarEvent(CalendarId, event)
            .then(result => {
                if (!hiddeMessage) {
                    this.toastObj.show(this.toasts[1]);
                }
            })
            .catch(error => {
                this.toastObj.show(this.toasts[2]);
                console.log('error ->', error);
            })
    }

    deleteCalendarEventCRUD(calendarId, item, hiddeMessage, args) {
        deleteCalendarEvent(calendarId, item)
            .then(result => {
                if (!hiddeMessage) {
                    this.toastObj.show(this.toasts[1]);
                }
            })
            .catch(error => {
                if (error.result.error.errors[0] != undefined) {
                    if (error.result.error.errors[0].reason == "virtualCalendarManipulation" ||
                        error.result.error.errors[0].reason == "forbidden") {
                        this.scheduleObj.dataModule.dataManager.dataSource.json.push(args);
                        this.scheduleObj.refreshEvents();
                        this.toastObj.show({ content: error.result.error.errors[0].message, cssClass: 'e-toast-danger', icon: '' });
                        console.log('error ->', error);
                        return;
                    }
                }
                else {
                    this.toastObj.show(this.toasts[2]);
                    console.log('error ->', error);
                }
            })
    }

    updateCalendarEventCRUD(calendarId, item, event, hiddeMessage, args) {
        updateCalendarEvent(calendarId, item, event)
            .then(result => {
                this.loadCalendarEvents(calendarId, true);
                if (!hiddeMessage) {
                    this.toastObj.show(this.toasts[1]);
                }
            })
            .catch(error => {
                this.toastObj.show(this.toasts[2]);
                console.log('error ->', error);
            })
    }

    loadCalendarEvents(calendar, checked) {
        this.scheduleObj.showSpinner();

        let predicate;

        getEventList(calendar, this.scheduleObj.selectedDate)
            .then(result => {
                this.defaultCalendar = calendar;

                //Set checkedCalendarResourceData calendar items as cheked
                this.resourceCalendarData.find(x => x.id == calendar).checked = checked

                // if calandar from left sidebar list is checked load the main event list
                if (checked) {
                    this.dataManager = result.result;
                    this.onDataBinding(this.dataManager, calendar);
                }
                // if not remove from main event list
                else {
                    this.scheduleData = this.scheduleData.filter(function (obj) {
                        return obj.CalendarId !== calendar;
                    });
                }

                this.props.selectCalendar(calendar);

                // Filter selected calendar to pass to the query
                let calendars = groupBy(this.resourceCalendarData, "checked");

                // Set the calendar field as default when only one calendar is checked
                this.setDefaultCalendarField(calendars.true, calendar)

                // Load selected calendar to pass to the query
                this.predicateQueryEvents(calendars.true, predicate)

            })
            .catch(error => {
                console.log('error ->', error);
            })

    }

    setDefaultCalendarField(calendarList, calendar) {
        if (calendarList != undefined) {
            if (calendarList.length > 0) {
                calendarList.every(function (key) {
                    if (key.checked && key.primary) {
                        calendar = key.id;
                        return false;
                    }
                    else if (key.checked && key.primary === undefined) {
                        calendar = key.id;
                        return true
                    }
                });
            }
        }
        else {
            this.resourceCalendarData.forEach(function (key) {
                if (key.checked && key.primary) {
                    calendar = key.id;
                }
            })
        }

        // remove non calendar permissions
        //var result = [];
        //for (var i = 0; i < this.resourceCalendarData.length; i++) {
        //    if (this.resourceCalendarData[i].role === 'owner' ) {
        //        result.push(this.resourceCalendarData[i]);
        //    }
        //}
        //this.resourceCalendarData = result;


        this.resourceCalendarData.sort(function (a, b) {
            if (a.id === calendar) { return -1; }
            //if (a.firstname > {b.firstname) { return 1; }
            return 1;
        })








    }
    predicateQueryEvents(calendarList, predicate) {
        if (calendarList != undefined) {
            calendarList.forEach(function (valor, indice) {
                if (predicate) {
                    predicate = predicate.or('CalendarId', 'equal', valor.id);
                }
                else {
                    predicate = new Predicate('CalendarId', 'equal', valor.id);
                }
            });
        }
        this.scheduleObj.eventSettings.query = new Query().where(predicate);
        this.scheduleObj.refreshEvents();
    }

    handleScheduleDate(args) {
        this.scheduleObj.selectedDate = args.value;
        this.scheduleObj.dataBind();
    }

    handleScheduleOpenNewEventEditor() {
        var endTimeDate = new Date();
        endTimeDate.setMinutes(endTimeDate.getMinutes() + 60);
        let cellData = {
            startTime: new Date(Date.now()),
            endTime: endTimeDate,
        };
        this.scheduleObj.openEditor(cellData, 'Add');
    }

    handleScheduleOpenEditEventEditor() {
        let eventData = this.scheduleData.find(x => x.Id == this.props.lexon.idEvent)
        this.scheduleObj.openEditor(eventData, 'Save');
    }

    sidebarCalendarList() {
        this.props.getCalendars();
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
        this.setState({ to2: [...tag] })
    }

    onActionBegin(args) {

        //ask for iframe

        if (args.requestType === 'toolbarItemRendering') {
            if (args.requestType === 'toolbarItemRendering') {
                let CalendarsIconItem = {
                    align: 'Right', prefixIcon: 'calendar-icon', text: '', cssClass: 'e-schedule-calendar-icon'
                };
                args.items.push(CalendarsIconItem);

                if (!this.layoutIframe) {
                    let userIconItem = {
                        align: 'Right', prefixIcon: 'user-icon', text: 'Configuration', cssClass: 'e-schedule-user-icon'
                    };

                    args.items.push(userIconItem);
                }
                else {


                    let LogOutIconItem = {
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
                // this.props.setMailContacts(to);

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
            // this.props.setMailContacts(to);
        }
    }


    render() {
        const { t } = this.props;
        const { leftSideBar } = this.state;
        const { lexon } = this.props;

        if (this.props.calendarsResult != undefined) {
            if (this.props.calendarsResult.calendars.length < 1) {
                return this.renderSpinner();
            }
        }

        return (
            <div id='target' className='control-section'>
                <SidebarCnn
                    sidebar={this.state.sidebarComponent}
                    open={this.state.sidebarOpen}
                    pullRight={true}
                    docked={this.state.sidebarDocked}
                    styles={{
                        sidebar: {
                            background: 'white',
                            zIndex: 100,
                            overflowY: 'hidden',
                            WebkitTransition: '-webkit-transform 0s',
                            willChange: 'transform'
                        },
                        content: {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            overflowY: 'hidden',
                            overflowX: 'hidden',
                            WebkitOverflowScrolling: 'touch',
                            transition: 'left .0s ease-out, right .0s ease-out'
                        },
                        overlay: {
                            zIndex: 1,
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            opacity: 0,
                            visibility: 'hidden',
                            backgroundColor: 'rgba(0,0,0,.3)'
                        },
                        dragHandle: {
                            zIndex: 1,
                            position: 'fixed',
                            top: 0,
                            bottom: 0
                        }
                    }}>
                    <Fragment>
                        {!this.layoutIframe ? (
                            <div >
                                <Header
                                    googleUser={this.props.googleUser}
                                    onSignout={this.onSignout}
                                    onSignoutDisconnect={this.onSignout}
                                    setSearchQuery={this.props.setSearchQuery}
                                    getLabelMessages={this.getLabelMessages}
                                    searchQuery={this.props.searchQuery}
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

                        <section className='main hbox space-between'>

                            <Sidebar
                                sideBarCollapsed={this.state.leftSideBar.collapsed}
                                sideBarToggle={this.toggleSideBar}
                                getCalendarList={this.sidebarCalendarList}
                                pathname={this.props.location.pathname}
                                calendarResult={this.props.calendarsResult}
                                onCalendarClick={this.loadCalendarEvents}
                                onSidebarCloseClick={this.handleShowLeftSidebarClick}
                                onCalendarChange={this.handleScheduleDate}
                                onCalendarOpenEditor={this.handleScheduleOpenNewEventEditor}
                                onCalendarOpenCalnendarView={this.openCalendarView}
                                onCalendarDelete={this.deleteCalendar}
                                onCalendarColorModify={this.calendarColorModify}
                                isIframeContainer={this.layoutIframe}
                                ref={sidebar => this.sidebarCalendarObj = sidebar}
                            />


                            <article className='d-flex flex-column position-relative'>
                                <div className="hidden">
                                    <AttendeeAddress
                                        id='to'
                                        addresses={this.state.to2}
                                        onAddressAdd={this.handleAddAddress}
                                        onAddressRemove={this.handleRemoveAddress}
                                        onAddressMove={this.handleMoveAddress}
                                        getAddresses={this.props.getAddresses}
                                        label={i18n.t('compose-message.to')}
                                        ref={tag => this.tagObjHead = tag}
                                    />
                                </div>
                                {/*  <div className="hidden">
                                    <ReactTagInput
                                        onkeypress="alert('')"
                                        tags={this.state.tagAttendess}
                                        placeholder={i18n.t("schedule.attendees")}
                                        maxTags={10}
                                        editable={true}
                                        readOnly={false}
                                        removeOnBackspace={true}
                                        ref={tag => this.tagObj = tag}
                                        onChange={(newTags) => this.setEmailTags(newTags)}
                                        validator={(value) => {
                                            // Don't actually validate e-mails this way
                                            const isEmail = value.indexOf("@") !== -1;
                                            if (!isEmail) {
                                                alert("Please enter an e-mail address");
                                            }
                                            // Return boolean to indicate validity
                                            return isEmail;
                                        }}
                                    />
                                </div>*/}

                                <div className="hidden">
                                    <Reminder
                                        reminders={this.state.reminders}
                                        ref={rem => this.remObj = rem}
                                    />
                                </div>

                                <div className="hidden">
                                    <div className='buttons-wrapper'  ref={but => this.buttonEventTypeObj = but}>
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

                                <div className='schedule-control-section'>
                                    <div className='col-lg-12 control-section'>
                                        <div className='control-wrapper'>
                                            <ScheduleComponent
                                                //delayUpdate='false'
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
                                                //actionComplete={this.onActionComplete.bind(this)}
                                                //allowVirtualScrolling = "true"
                                                cellDoubleClick={this.doubleOpen.bind(this)}
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
                                                    {/*<ResourceDirective field='eventType' title={i18n.t("schedule.eventtype")} name='eventType' allowMultiple={false} dataSource={this.eventTypeDataSource} textField='text' idField='id' colorField='backgroundColor' />  */}
                                                    <ResourceDirective ref={this.calendarObj} field='CalendarId' title={i18n.t("calendar-sidebar.mycalendars")} name='Calendars' allowMultiple={false} dataSource={this.resourceCalendarData} textField='summary' idField='id' colorField='backgroundColor' />
                                                </ResourcesDirective>
                                                <Inject services={[Day, Week, WorkWeek, Month, Agenda, Resize, DragAndDrop]} />
                                            </ScheduleComponent>
                                        </div>
                                    </div>
                                </div>

                                <ToastComponent ref={(toast) => { this.toastObj = toast; }}
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
                                    header={i18n.t("calendar.title")}
                                    visible={this.state.hidePromptDialog}
                                    showCloseIcon={true}
                                    animationSettings={this.animationSettings}
                                    width='575px'
                                    ref={dialog => this.promptDialogInstance = dialog}
                                    target='#target'
                                    open={this.dialogOpen.bind(this)}
                                    close={this.dialogClose.bind(this)}>
                                    <div>{(this.state.hidePromptDialog) ? <Calendars
                                        calendarId={this.state.calendarToEdit}
                                        close={this.dialogClose.bind(this)}
                                    /> : ''}</div>
                                </DialogComponent>
                                <DialogComponent
                                    id='eventTypes'
                                    isModal={true}
                                    header={i18n.t("contactimport.title")}
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
                                        googleUser={this.props.googleUser}
                                        close={this.dialogClose.bind(this)}
                                    /> : ''}</div>
                                </DialogComponent>

                                <DialogComponent
                                    id='contactImports'
                                    isModal={true}
                                    header={i18n.t("contactimport.title")}
                                    visible={this.state.showPromptImportContactsDialog}
                                    showCloseIcon={true}
                                    animationSettings={this.animationSettings}
                                    width='900px'
                                    ref={dialog => this.promptDialogEventTypeInstance = dialog}
                                    target='#target'
                                    open={this.dialogOpen.bind(this)}
                                    close={this.dialogImportConcatcsClose.bind(this)}>
                                    <div>{(this.state.showPromptImportContactsDialog) ? <EventsImport
                                        getlistEventTypes={this.getlistEventTypes.bind(this)}
                                        googleUser={this.props.googleUser}
                                        close={this.dialogClose.bind(this)}
                                    /> : ''}</div>
                                </DialogComponent>

                            </article>
                        </section>
                    </Fragment>


                    {this.layoutIframe && this.layoutIframeNewEventView || this.layoutIframeEditEventView ? (
                        <style jsx>{`
                        .e-dlg-overlay {
                            background-color: #FFFFFF !important;
                            opacity: 1 !important;
                            box-shadow: none !important
                        }

                        .e-dialog {
                            background-color: #fff;
                            box-shadow: none !important
                        }

                    `}</style>

                    ) : (
                        <style jsx>{``}</style>
                    )}

                </SidebarCnn>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    calendarsResult: state.calendarsResult,
    lexon: state.lexon,
});

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            getCalendars,
            //toggleSelected,
            selectCalendar,
            setGUID: ACTIONS.setGUID,
            setSign: ACTIONS.setSign
        },
        dispatch
    );

export default compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps)
)(Main);


