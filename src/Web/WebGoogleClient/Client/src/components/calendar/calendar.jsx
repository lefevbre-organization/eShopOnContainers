import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import ACTIONS from '../../actions/lexon';
import Header from '../header/Header';
import Sidebar from './sidebar/Sidebar';
import { Notification } from '../notification/';
import './calendar.scss';
import { Route, Switch, withRouter } from 'react-router-dom';
import { getCalendars } from './sidebar/sidebar.actions';
import {toggleSelected} from '../content/message-list/actions/message-list.actions';
import { selectCalendar } from './sidebar/sidebar.actions';
import { signOut } from '../../api/authentication';
import { signOutDisconnect } from '../../api/authentication';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import SidebarCnn from 'react-sidebar';
import LexonComponent from '../../apps/lexon_content';
import CalendarComponent from '../../apps/calendar_content';
import { CalendarView } from './calendarview/CalendarView';
import 'react-reflex/styles.css';
import { resetDefaultAccount} from '../../api/accounts';
import {
    ScheduleComponent, ViewsDirective, ViewDirective,
    Day, Week, WorkWeek, Month, Agenda, Inject, Resize, DragAndDrop, DragEventArgs, ResourcesDirective, ResourceDirective,
} from '@syncfusion/ej2-react-schedule';
import { DataManager, Query, Predicate } from '@syncfusion/ej2-data';
import { ToastComponent, ToastCloseArgs } from '@syncfusion/ej2-react-notifications';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { deleteCalendar, getEventList, addCalendarEvent, deleteCalendarEvent, updateCalendarEvent, requestRecurringEvent, listCalendarList, updateCalendarList } from '../../api/calendar-api';
import moment from 'moment';
import groupBy from "lodash/groupBy";
import orderBy from "lodash/orderBy";



export class Calendar extends Component {

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
        this.dataManager = new DataManager();
        this.defaultCalendar = undefined;  
        this.scheduleData = [];
        //this.CalendarList = [];
        this.position = { X: 'Center', Y: 'Bottom' };       
        this.resourceCalendarData = [];

        this.toasts =  [
        { content: 'Processing', cssClass: '', icon: '' },
        { content: 'The event has been created successfully.', cssClass: 'e-toast-success', icon: 'e-success toast-icons' },
        { content: 'The event has been modified successfully.', cssClass: 'e-toast-success', icon: 'e-success toast-icons' },
        { content: 'A problem has been occurred while submitting your data.', cssClass: 'e-toast-danger', icon: 'e-error toast-icons' },
        { content: 'The calendar has been created successfully.', cssClass: 'e-toast-success', icon: 'e-success toast-icons' },
        //{ title: 'Information!', content: 'Please read the comments carefully.', cssClass: 'e-toast-info', icon: 'e-info toast-icons' }
                       ];

        this.state = {
            isVisible: true, 
            sidebarOpen: false,
            sidebarDocked: false,  
            leftSideBar: {
                collapsed: false
            }, 
            hidePromptDialog: false,
            calendarToEdit: undefined,
        };


           // Calednar View Dialog
        //this.promptButtonRef = element => {
        //    this.promptButtonEle = element;
        //};
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
                this.toastObj.show(this.toasts[3]);                
            });   
        
    }


    deleteCalendar(args) {  
        this.toastObj.show(this.toasts[0]);
      deleteCalendar(args.currentTarget.id )
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
            this.sidebarCalendarList();
            this.LoadCalendarList(true)
            this.toastObj.show(this.toasts[4]);
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
    //hide: { effect: 'SlideBottomOut' },
    show: { effect: 'SlideBottomIn' }
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

    onDataBinding(e, calendarId ) {
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
                let recurrenceRule
                if (event.recurrence != undefined) {
                    recurrenceRule = event.recurrence[0].replace('RRULE:', '');
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

                    //Fake to remove
                    //resources: [{
                    //    field: "calendarId",
                    //    title: "Calendar",
                    //    resourceSettings: {
                    //        dataSource: [{
                    //            CalendarText: "alberto",
                    //            id: 1,
                    //            CalendarColor: "#f8a398"
                    //        }, {
                    //            CalnendarText: "Steven",
                    //            id: 2,
                    //            CalendarColor: "#56ca95"
                    //        }],
                    //        text: "calnedarText",
                    //        id: "id",
                    //        color: "calendarColor"
                    //    }
                    //}],
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
                    selectedMessages: selectedMessages,
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

      this.sidebarCalendarList();  
      this.LoadCalendarList();
         
    }

    LoadCalendarList(DisableloadSchedule) {
        this.resourceCalendarData=[]
        listCalendarList()
            .then(result => {
                this.resourceCalendarData = orderBy(result.items, "primary");
                this.resourceCalendarData.find(x => x.id == this.resourceCalendarData[0].id).checked = true;
                if (!DisableloadSchedule) {
                    this.loadCalendarEvents(this.resourceCalendarData[0].id, true);
                }
                  
            })
            .catch(error => {
                console.log('error ->', error);
            });     
    }

    componentWillUnmount() {
        //window.removeEventListener(
        //    'GetUserFromLexonConnector',
        //    this.handleGetUserFromLexonConnector
        //);
    }
 
    buildEventoGoogle(values) {  
        
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
        }

        if (values.RecurrenceRule != undefined) { event.recurrence = ['RRULE:' + values.RecurrenceRule] };
       // if (values.RecurrenceException != undefined) { event.RecurrenceException = [values.RecurrenceException] };
        
        //if (values.IsAllDay != undefined) { event.isallday = values.IsAllDay };        
      
            //'attendees': [
            //    { 'email': 'lpage@example.com' },
            //    { 'email': 'sbrin@example.com' },
            //],
            //'reminders': {
            //    'useDefault': false,
            //    'overrides': [
            //        { 'method': 'email', 'minutes': 24 * 60 },
            //        { 'method': 'popup', 'minutes': 10 },
            //    ],
            //},       

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

    onPopupOpen(args) {

        if (args.type === 'QuickInfo') {

        }
        if (args.type === 'Editor') {
            if (!args.element.querySelector('.custom-field-row')) {
                //let row = createElement('div', { className: 'custom-field-row' });
                //let formElement = args.element.querySelector('.e-schedule-form');
                //formElement.firstChild.insertBefore(row, formElement.firstChild.firstChild);
                //let container = createElement('div', { className: 'custom-field-container' });
                //let inputEle = createElement('input', {
                //    className: 'e-field', attrs: { name: 'EventType' }
                //});
                //container.appendChild(inputEle);
                //row.appendChild(container);
                //let drowDownList = new DropDownList({
                //    dataSource: [
                //        { text: 'Public Event', value: 'public-event' },
                //        { text: 'Maintenance', value: 'maintenance' },
                //        { text: 'Commercial Event', value: 'commercial-event' },
                //        { text: 'Family Event', value: 'family-event' }
                //    ],
                //    fields: { text: 'text', value: 'value' },
                //    value: args.data.EventType,
                //    floatLabelType: 'Always', placeholder: 'Event Type'
                //});
                //drowDownList.appendTo(inputEle);
                //inputEle.setAttribute('name', 'EventType');
            }
        }
    }

    onEventRendered(args) {
        let event;
        
        switch (args.requestType) {
           
            case 'eventChanged':

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

                //call function to update event
                this.updateCalendarEventCRUD(calendarToModify, itemToModify, event);
                               
                break;

            case 'eventCreated':
               
                event = this.buildEventoGoogle(args.data[0]);

                //call function to add event
               // this.addCalendarEventCRUD(args.data[0].CalendarId, event, args);   
                addCalendarEvent(args.data[0].CalendarId, event)
                    .then(result => {
                        args.data[0].Id = result.id  
                        this.scheduleObj.refreshEvents();
                        this.toastObj.show(this.toasts[1]);                       
                    })
                    .catch(error => {
                        this.toastObj.show(this.toasts[3]);
                        console.log('error ->', error);
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
                this.deleteCalendarEventCRUD(calendarFromRemove, item);                

                break;
        }  
       
    }  

    addCalendarEventCRUD(CalendarId, event, hiddeMessage) {
        addCalendarEvent(CalendarId, event)
            .then(result => {  
                if (!hiddeMessage) {
                    this.toastObj.show(this.toasts[1]);
                }               
            })
            .catch(error => {
                this.toastObj.show(this.toasts[3]);
                console.log('error ->', error);
            })
    }

    deleteCalendarEventCRUD(calendarId, item, hiddeMessage) {
        deleteCalendarEvent(calendarId, item)
            .then(result => {
                if (!hiddeMessage) {
                    this.toastObj.show(this.toasts[2]);
                }
            })
            .catch(error => {
                this.toastObj.show(this.toasts[3]);
                console.log('error ->', error);
            })
    }

    updateCalendarEventCRUD(calendarId, item, event, hiddeMessage) {
        updateCalendarEvent(calendarId, item, event)
            .then(result => {
                if (!hiddeMessage) {
                    this.toastObj.show(this.toasts[2]);
                }
            })
            .catch(error => {
                this.toastObj.show(this.toasts[3]);
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

    renderInboxViewport() {
        const { leftSideBar } = this.state;
        const { lexon } = this.props;

        if (this.props.calendarsResult.calendars.length < 1) {
            return this.renderSpinner();
        }

        return (
            <div id='target' className='col-lg-12 control-section'>
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
                    <Header
                        googleUser={this.props.googleUser}
                        onSignout={this.onSignout}
                        onSignoutDisconnect={this.onSignout}
                        setSearchQuery={this.props.setSearchQuery}
                        getLabelMessages={this.getLabelMessages}
                        searchQuery={this.props.searchQuery}
                    />
                    <section className='main hbox space-between'>
                        <Sidebar
                            sideBarCollapsed={leftSideBar.collapsed}
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
                            {/*popupOpen={this.onPopupOpen.bind(this)}*/}
                                <div className='schedule-control-section'>
                                    <div className='col-lg-12 control-section'>
                                        <div className='control-wrapper'>
                                            <ScheduleComponent
                                                ref={schedule => this.scheduleObj = schedule}
                                                width='100%' 
                                                currentView="Month"
                                                height='650px' 
                                                actionComplete={this.onEventRendered.bind(this)}
                                                popupOpen={this.onPopupOpen.bind(this)}                                           
                                                eventSettings={{ dataSource: this.scheduleData }}
                                                dragStart={(this.onEventDragStart.bind(this))}
                                                eventClick={(this.onEventClick.bind(this))}
                                                dragStop={(this.onEventDragStop.bind(this))}>
                                                <ViewsDirective>
                                                    <ViewDirective option='Day' />
                                                    <ViewDirective option='Week' />
                                                    <ViewDirective option='WorkWeek' />
                                                    <ViewDirective option='Month' />
                                                    <ViewDirective option='Agenda' />
                                                </ViewsDirective>
                                                <ResourcesDirective>
                                                    <ResourceDirective field='CalendarId' title='My Calendars' name='Calendars' allowMultiple={false} dataSource={this.resourceCalendarData} textField='summary' idField='id' colorField='backgroundColor'>
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
                                    header='Calendar Configuration'
                                    visible={this.state.hidePromptDialog}
                                    showCloseIcon={true}
                                    animationSettings={this.animationSettings}
                                    width='475px'
                                    ref={dialog => this.promptDialogInstance = dialog}
                                    target='#target'
                                    open={this.dialogOpen.bind(this)}
                                    close={this.dialogClose.bind(this)}>
                                    <div>{(this.state.hidePromptDialog) ? <CalendarView
                                    calendarToEdit={this.state.calendarToEdit} 
                                    close={this.dialogClose.bind(this)}
                                    /> : ''}</div>                                   
                            </DialogComponent>                           

                        {/*</Switch>*/}
                        </article>

                        <div className='productpanel'>                           
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
                        </div>
                    </section>
                </Fragment>
                </SidebarCnn>
            </div>
        );
    }

    render() {
        if (this.state.googleDown) {
            const { showNotification, messageNotification } = this.state;
            const { token } = this.props.lexon;
            const baseUrl = window.URL_MF_GOOGLE.replace("/user", "");

            return (
                <div className='d-flex h-100 align-items-center justify-content-center'>
                    <Notification
                        initialModalState={showNotification}
                        toggleNotification={() => {
                            messageNotification === 'El mensaje no está en el servidor'
                                ? ((token) ? window.open(`${baseUrl}/access/${token}/?prov=GO0`, "_self") : window.open(`${window.URL_MF_GOOGLE}/GO0${this.props.lexon.userId}`, '_self'))
                                : this.onSignoutDisconnect();
                        }}
                        message={messageNotification}
                    />
                </div>
            );
        }
        return this.renderInboxViewport();
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
            toggleSelected,
            selectCalendar,                   
            setGUID: ACTIONS.setGUID,
            setSign: ACTIONS.setSign
        },
        dispatch
    );

export default compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps)
)(Calendar);


