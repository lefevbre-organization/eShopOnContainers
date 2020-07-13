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
import { setCulture, L10n, loadCldr, Internationalization } from '@syncfusion/ej2-base';
import currencies from 'cldr-data/main/es/currencies.json';
import gregorian from 'cldr-data/main/es/ca-gregorian.json';
import numbers from 'cldr-data/main/es/numbers.json';
import timeZoneNames from 'cldr-data/main/es/timeZoneNames.json';
import numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import weekData from 'cldr-data/supplemental/weekData.json';// To load the culture based first day of week
import i18n from 'i18next';
import Reminder from "./reminder/reminder"

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
        this.handleScheduleOpenEditor = this.handleScheduleOpenEditor.bind(this);
        this.openCalendarView = this.openCalendarView.bind(this);
        this.deleteCalendar = this.deleteCalendar.bind(this);
        this.calendarColorModify = this.calendarColorModify.bind(this);
        this.onEventRendered = this.onEventRendered.bind(this);
        this.buildEventoGoogle = this.buildEventoGoogle.bind(this);
        //this.onBefoireClose = this.onBefoireClose.bind(this);

        this.cancel = false;
        
        this.dataManager = new DataManager();
        this.defaultCalendar = undefined;
        this.scheduleData = [];
        //this.CalendarList = [];
        this.position = { X: 'Center', Y: 'Bottom' };
        this.resourceCalendarData = [];
        //this.ownerData = [];  
        this.toasts = [
            { content: i18n.t("schedule.toast-processing"), cssClass: 'e-toast-black', icon: '' },
            { content: i18n.t("schedule.toast-process-complete"), cssClass: 'e-toast-black', icon: '' },
            { content: i18n.t("schedule.toast-process-error"), cssClass: 'e-toast-danger', icon: 'e-error toast-icons' }
        ]
        this.instance = new Internationalization();
        this.tabInstance = new TabComponent;
        this.state = {
            isVisible: true,
            sidebarOpen: false,
            sidebarDocked: false,
            leftSideBar: {
                collapsed: false
            },
            hidePromptDialog: false,
            calendarToEdit: undefined,
            tagAttendess: [],
            reminders:[],
            eventType: undefined
            //externalcomponent: "<LexonComponent sidebarDocked={this.onSetSidebarDocked} />"
        };
        this.handleGetUserFromLexonConnector = this.handleGetUserFromLexonConnector.bind(
            this
        );
        // Calednar View Dialog
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

        this.tabObj=undefined;

        //params for iframe enbebed functions
        if (this.props.location.search == "?layout=iframe") {
            this.layoutIframe = true;
        }
        else {
            this.layoutIframe = false;
        }


    }

    async setGlobalization() {
        if (window.navigator.language.includes("es-")
            || (window.navigator.language == "ca")
            || (window.navigator.language == "ga")
            || (window.navigator.language == "eu")) {
            loadCldr(currencies, numberingSystems, gregorian, numbers, timeZoneNames, weekData);
            const data = await import('../../syncfusion-resources/calendar-es.json')
            setCulture('es');
            L10n.load(data);
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
        deleteCalendar(args.currentTarget.id)
            .then(result => {

                this.LoadCalendarList(true)
                this.sidebarCalendarList();

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

    eventTemplate(props) {
        return (
            <div>
                <div className="image"><img width="16" height="16" src={"assets/img/" + props.ImageName + ".png"} /> {props.Subject}</div>
                {/* <div className="subject">{props.Subject}</div>
               <div className="time">Time: {this.getTimeString(props.StartTime)} - {this.getTimeString(props.EndTime)}</div>*/}

            </div>);
    }

    onDataBinding(e, calendarId) {
        let items = this.dataManager.items;
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
                let eventType
                if (event.extendedProperties != undefined) {
                    eventType = event.extendedProperties.private.eventType;
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
                    RecurrenceRule: recurrenceRule,
                    ImageName: "icon-lefebvre-bl",
                    Attendees: attendees,
                    EventType: eventType,
                    Reminders: event.reminders.overrides,
                });
            }
        }
        e.result = this.scheduleData;
    }

    toggleSideBar() {
        const toggleCollapsed = !this.state.leftSideBar.collapsed;
        this.setState({
            leftSideBar: {
                collapsed: toggleCollapsed
            }
        });
    }

    sendMessagePutUser(user) {
        const { selectedMessages, googleUser } = this.props;

        window.dispatchEvent(
            new CustomEvent('PutUserFromLexonConnector', {
                detail: {
                    user,
                    selectedMessages: [],
                    idCaseFile: this.props.lexon.idCaseFile,
                    bbdd: this.props.lexon.bbdd,
                    idCompany: this.props.lexon.idCompany,
                    provider: this.props.lexon.provider,
                    account: googleUser.getBasicProfile().getEmail()
                }
            })
        );
    }

    handleGetUserFromLexonConnector() {
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
        this.setState({ sidebarDocked: open });
    }

    onSetSidebarOpenLexon(open) {
        this.setState({
            sidebarComponent: (
                <LexonComponent sidebarDocked={this.onSetSidebarDocked} />
            )
        });
        this.setState({ sidebarDocked: open });
    }

    onSetSidebarDocked(open) {
        this.setState({ sidebarDocked: open });
    }

    componentDidMount() {

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
        this.LoadCalendarList();
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
            "extendedProperties": {
                "private": {
                    'eventType': 'profesional-event'
                },
            }, 

        }

        //Recurrence
        if (values.RecurrenceRule != undefined) { event.recurrence = ['RRULE:' + values.RecurrenceRule] };

        //Atendees
        let arr = this.state.tagAttendess
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
                'overrides':[],
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

    onPopupOpen(args) {             

        if (args.type === 'QuickInfo') {
            var formElement = args.element.querySelector('.e-schedule-form');
            if (formElement != null) {
                var validator = (formElement).ej2_instances[0];
                validator.addRules('Subject', { required: [true, i18n.t("schedule.validator-required")] });
            }          

        }
        if (args.type === 'Editor') {           

            var dialogObj = args.element.ej2_instances[0];
            dialogObj.buttons[1].buttonModel.isPrimary = false;
            args.element.style.width = "700px";
            args.element.style.height = "750px";

            var formElement = args.element.querySelector('.e-schedule-form');
            if (formElement != null) {
                var validator = (formElement).ej2_instances[0];
                validator.addRules('Subject', { required: [true, i18n.t("schedule.validator-required")] });
            }  

            // default values for Atendees coming from event args
            if (args.data.Attendees != undefined) {
                //const peopleArray = Object.keys(args.data.Attendees).map(i => args.data.Attendees[i]) 
                var arr = [];
                Object.keys(args.data.Attendees).forEach(function (key) {
                    arr.push(args.data.Attendees[key].email);
                });
                this.setState({ tagAttendess: arr })
            }
            else {
                this.setState({ tagAttendess: [] })
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

            //// default values for eventType coming from event args
            //let eventType;
            //if (args.data.EventType == undefined) {
            //    this.setState({
            //        eventType: 'profesional-event'
            //    });
            //}
            //else {
            //    this.setState({
            //        eventType: args.data.EventType
            //    });
            //}



            // Create required custom elements in initial time
            if (!args.element.querySelector('.custom-field-row')) {
                let row = createElement('div', { className: 'custom-field-row' });
                let formElement = args.element.querySelector('.e-schedule-form');
                formElement.firstChild.insertBefore(row, formElement.lastChild.lastChild);

                // Adding type of event element
                //let containerEventType = createElement('div', { className: 'custom-field-container' });
                //row.appendChild(containerEventType);
                //let inputEle = createElement('input', {
                //    className: 'e-field', attrs: { name: 'EventType' }
                //});
                //containerEventType.appendChild(inputEle);

                //let drowDownList = new DropDownList({
                //    dataSource: [
                //        { text: i18n.t("schedule.profesional-event"), value: 'profesional-event' },
                //        { text: i18n.t("schedule.personal-event"), value: 'personal-event' },
                //    ],
                //    fields: { text: 'text', value: 'value' },
                //    value: this.state.eventType,
                //    floatLabelType: 'Always', placeholder: i18n.t("schedule.eventtype")
                //});
                //drowDownList.appendTo(inputEle);
                //inputEle.setAttribute('name', 'EventType');


                // Adding attendees tag element
                let containerTab = createElement('div', { className: 'custom-field-container' });
                row.appendChild(containerTab);
                var nodeA = ReactDOM.findDOMNode(this.tagObj);
                containerTab.appendChild(nodeA);

                // Adding reminder element               
                
                var nodeR = ReactDOM.findDOMNode(this.remObj);
                containerTab.appendChild(nodeR);


            }

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

    onDataBound() {   
        //this.scheduleObj.eventWindow.dialogObject.beforeClose = function (args) {
        //    args.cancel = this.cancel;
        //    this.cancel = false;
        //}
    }

    onActionBegin(args) {
        //if (args.requestType === 'eventCreate' || args.requestType === 'eventChange') {
        //    var subject = (args.requestType === 'eventCreate') ? args.data[0].Subject : args.data.Subject;
        //    //if (subject == 'New') {
        //        args.cancel = true;
        //        this.cancel = true;
        //        let val = this.cancel;
        //        this.scheduleObj.eventWindow.dialogObject.beforeClose = function (args) {
        //            args.cancel = val;
        //            alert("Don't Close the Appointment Window");
        //        }
        //        this.cancel = false;
        //    //}
        //}
    } 

    onEventRendered(args) {
        let event;       

        switch (args.requestType) {

            case 'eventChanged':

                // TO FIX BECOUSE REFRESH OF ATTENDES ARGS ARE NOT WORKING FINE
                // Update current Event in calendar (not in google cloud)
                //let att = this.state.tagAttendess;
                //args.data.Attendees = [];
                //if (att != undefined) {
                //    Object.keys(att).forEach(function (key) {
                //     args.data.Attendees.push({ 'email': att[key] });
                //     });                           
                //   }
                //else {
                //    args.data.Attendees = undefined;
                //}
                //this.scheduleObj.refreshEvents();
                //this.scheduleObj.refresh();

               // Update Reminders                
                //let arrR = this.remObj.listviewInstance.dataSource;
                //args.data.Reminders = [];               
                //if (arrR.length > 0) {                   
                //    Object.keys(arrR).forEach(function (key) {
                //        //args.changedRecords.Reminders.push({
                //        //    method: arrR[key].title,
                //        //    minutes: arrR[key].value,
                //        //});
                 //        //args.data.Reminders.push({
                //        //    method: arrR[key].title,
                //        //    minutes: arrR[key].value,
                //        //});
                //        //this.scheduleObj.eventWindow.eventData.Reminders.Reminders.push({
                //        //    method: arrR[key].title,
                //        //    minutes: arrR[key].value,
                //        //});

                //    });
                //}

              
                event = this.buildEventoGoogle(args.data);


                let itemToModify = args.data.Id
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
                    itemToModify = args.changedRecords[0].Id;
                    calendarToModify = args.changedRecords[0].CalendarId
                    event = this.buildEventoGoogle(args.changedRecords[0]);
                }

                // this.setState({ tagAttendess: [] })

                //call function to update event
                this.updateCalendarEventCRUD(calendarToModify, itemToModify, event);  

                //this.scheduleObj.eventWindow.eventData.Id = "pepe";
                

               // let obj = this.scheduleObj.eventsData.findIndex(args.data.Id)

                //const getelem = this.scheduleObj.eventsData.find(id => id.Id === args.data.Id);
                //getelem.Id = "pepe";
                //this.scheduleObj.refresh();
                //this.scheduleObj.dataBind();
               

                break;

            case 'eventCreated':

                //if (this.scheduleObj.eventWindow.eventData != undefined) {
                //    if (this.scheduleObj.eventWindow.eventData.typeEvent != "lexon") {
                        event = this.buildEventoGoogle(args.data[0]);

                        //call function to add event
                        // this.addCalendarEventCRUD(args.data[0].CalendarId, event, args);   
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
                                this.setState({ tagAttendess: [] })

                                args.data[0].Reminders = result.reminders.overrides;                                

                               // this.scheduleObj.refreshEvents();
                                this.toastObj.show(this.toasts[1]);
                            })
                            .catch(error => {
                                this.toastObj.show(this.toasts[2]);
                                console.log('error ->', error);
                            })
                //    }
                //    else {
                //        //this.scheduleObj.saveEvent(args.data[0]);
                //        args.cancel = true;
                //    }
                //}
              
                
               
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
                this.deleteCalendarEventCRUD(calendarFromRemove, item);

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

    deleteCalendarEventCRUD(calendarId, item, hiddeMessage) {
        deleteCalendarEvent(calendarId, item)
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

    updateCalendarEventCRUD(calendarId, item, event, hiddeMessage) {
        updateCalendarEvent(calendarId, item, event)
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

    loadCalendarEvents(calendar, checked) {
        this.scheduleObj.showSpinner();
        let predicate;


        getEventList(calendar, this.scheduleObj.selectedDate)
            .then(result => {
                this.defaultCalendar = calendar;
                this.props.selectCalendar(calendar);

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

                // Filter selected calendar to pass to the query
                let calendars = groupBy(this.resourceCalendarData, "checked");

                // Set the calendar field as default when only one calendar is checked
                // this.setDefaultCalendarField(calendars.true, calendar)

                // Load selected calendar to pass to the query
                this.predicateQueryEvents(calendars.true, predicate)

            })
            .catch(error => {
                console.log('error ->', error);
            })

    }

    //setDefaultCalendarField(calendarList, calendar) {
    //    if (calendarList != undefined) {
    //        if (calendarList.length === 1) {
    //            this.resourceCalendarData.sort(function (a, b) {
    //                if (a.id === calendar) { return -1; }
    //                //if (a.firstname > b.firstname) { return 1; }
    //                return 0;
    //            })
    //        }
    //    }      
    //}

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

    handleScheduleOpenEditor() {
        var endTimeDate = new Date();
        endTimeDate.setMinutes(endTimeDate.getMinutes() + 60);
        let cellData = {
            startTime: new Date(Date.now()),
            endTime: endTimeDate,
        };
        this.scheduleObj.openEditor(cellData, 'Add');
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
        //sessionStorage.clear();
        //localStorage.clear();
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
        //sessionStorage.clear();
        //localStorage.clear();
    }

    setEmailTags(tag) {
        this.setState({ tagAttendess: [...tag] })
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
                            //transition: "opacity .3s ease-out, visibility .0s ease-out",
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
                                />
                            </div>
                        ) : (
                                <div>

                                </div>
                            )}

                        <section className='main hbox space-between'>

                            <Sidebar
                                sideBarCollapsed={!this.layoutIframe ? (false) : (true)}
                                sideBarToggle={this.toggleSideBar}
                                getCalendarList={this.sidebarCalendarList}
                                pathname={this.props.location.pathname}
                                calendarResult={this.props.calendarsResult}
                                onCalendarClick={this.loadCalendarEvents}
                                onSidebarCloseClick={this.handleShowLeftSidebarClick}
                                onCalendarChange={this.handleScheduleDate}
                                onCalendarOpenEditor={this.handleScheduleOpenEditor}
                                onCalendarOpenCalnendarView={this.openCalendarView}
                                onCalendarDelete={this.deleteCalendar}
                                onCalendarColorModify={this.calendarColorModify}

                            />
                            <article className='d-flex flex-column position-relative'>
                                {/*<Switch>*/}
                                <div className="hidden">
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
                                </div>

                                <div className="hidden">
                                    <Reminder
                                        reminders={this.state.reminders}
                                        ref={rem => this.remObj = rem}
                                    />
                                </div>

                                <div className='schedule-control-section'>
                                    <div className='col-lg-12 control-section'>
                                        <div className='control-wrapper'>
                                            <ScheduleComponent
                                                ref={schedule => this.scheduleObj = schedule}
                                                width='100%'
                                                currentView="Month"
                                                allowKeyboardInteraction={true}
                                                height='650px'
                                                views={this.viewsCollections}
                                                actionComplete={this.onEventRendered.bind(this)}
                                                //dataBound={this.onDataBound.bind(this)}
                                                //actionBegin={this.onActionBegin.bind(this)}
                                                //beforeClose={this.onBeforeClose.bind(this)}
                                                popupOpen={this.onPopupOpen.bind(this)}
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
                                                {/* editorTemplate={this.editorTemplate.bind(this)}*/}

                                                <ViewsDirective>
                                                    <ViewDirective option='Day' eventTemplate={this.eventTemplate.bind(this)} />
                                                    <ViewDirective option='Week' eventTemplate={this.eventTemplate.bind(this)} />
                                                    <ViewDirective option='WorkWeek' eventTemplate={this.eventTemplate.bind(this)} />
                                                    <ViewDirective option='Month' eventTemplate={this.eventTemplate.bind(this)} />
                                                    <ViewDirective option='Agenda' eventTemplate={this.eventTemplate.bind(this)} />
                                                </ViewsDirective>



                                                <ResourcesDirective>

                                                    {/* <ResourceDirective field='AttendeesId' title='Attendees' name='MeetingRoom' allowMultiple={true} >
                                                    </ResourceDirective> */}

                                                    <ResourceDirective field='CalendarId' title={i18n.t("calendar-sidebar.mycalendars")} name='Calendars' allowMultiple={false} dataSource={this.resourceCalendarData} textField='summary' idField='id' colorField='backgroundColor'>
                                                    </ResourceDirective>

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

                                {/*</Switch>*/}
                            </article>

                            {/* <div className='productpanel'>
                                <span className='productsbutton'>
                                    {lexon.user ? (
                                        <div onClick={() => this.onSetSidebarOpenLexon(true)}>
                                            <img
                                                className='imgproduct'
                                                border='0'
                                                alt='Lex-On'
                                                src='/assets/img/icon-lexon.png'></img>
                                        </div>
                                    ) : (
                                            <div>
                                                <img
                                                    className='imgproductdisable'
                                                    border='0'
                                                    alt='Lex-On'
                                                    src='/assets/img/icon-lexon.png'></img>
                                            </div>
                                        )}
                                </span>
                            </div>*/}
                        </section>
                    </Fragment>
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


