import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import ACTIONS from '../../actions/lexon';
import Header from './header/Header';
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
import 'react-reflex/styles.css';
import { resetDefaultAccount} from '../../api/accounts';
import {
    ScheduleComponent, ViewsDirective, ViewDirective,
    Day, Week, WorkWeek, Month, Agenda, Inject, Resize, DragAndDrop, DragEventArgs, ResourcesDirective, ResourceDirective,
} from '@syncfusion/ej2-react-schedule';
import { DataManager, WebApiAdaptor } from '@syncfusion/ej2-data';
import { extend, createElement } from '@syncfusion/ej2-base';
import { getEventList, addCalendarEvent, deleteCalendarEvent, updateCalendarEvent, requestRecurringEvent } from '../../api/calendar-api';

import { DropDownList } from '@syncfusion/ej2-dropdowns';
import moment from 'moment';

export class Calendar extends Component {
    constructor(props) {
        super(props);

        this.getCalendarList = this.getCalendarList.bind(this);       
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
        this.onEventRendered = this.onEventRendered.bind(this);
       

        this.state = {
            isVisible: true,
            fluid: true,
            customAnimation: false,
            slow: false,
            size: 0.25,
            sidebarOpen: false,
            sidebarDocked: false,
            googleDown: false,
            showNotification: false,
            messageNotification: '',
            leftSideBar: {
                collapsed: false
            },
            sidebarComponent: (
                <img border='0' alt='Lefebvre' src='/assets/img/lexon-fake.png'></img>
            ),

        };

        this.dataManger = new DataManager(); 
        this.defaultCalendar = undefined;

        this.resourceData = [
            { Text: 'alberto.valverde.escribano@gmail.com', Id: 1, Color: '#ea7a57' },
            { Text: 'Calendario de AV', Id: 2, Color: '#df5286' },           
        ];
           
    }


    onDataBinding(e) {        
        let items = this.dataManger.items;
        let scheduleData = [];
        if (items.length > 0) {
            for (let i = 0; i < items.length; i++) {               
                let event = items[i];
                if (event.status === 'cancelled') {
                    var dateStartTime = new Date(event.originalStartTime.dateTime);                    
                    var dateString = moment(dateStartTime).seconds(0).toISOString().split('.')[0] + "Z";
                    var ExcRecurenceDate = dateString.replace(/[:.-]/g, "");                  
                    var ParentscheduleException = "";
                    var coma=""
                    if (scheduleData.find(x => x.Id == event.recurringEventId).RecurrenceException != undefined) {
                        ParentscheduleException = scheduleData.find(x => x.Id == event.recurringEventId).RecurrenceException;
                        coma = ","
                    }
                    scheduleData.find(x => x.Id == event.recurringEventId).RecurrenceException = ParentscheduleException + coma + ExcRecurenceDate                   
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
                    scheduleData.push({
                        Id: event.id,
                        Subject: event.summary,
                        Location: event.location,
                        Description: event.description,
                        StartTime: new Date(start),
                        EndTime: new Date(end),
                        IsAllDay: !event.start.dateTime,
                        RecurrenceRule: recurrenceRule,  
                        resources: [{
                            field: "calendarId",
                            title: "Calendar",
                            resourceSettings: {
                                dataSource: [{
                                    CalendarText: "alberto",
                                    id: 1,
                                    CalendarColor: "#f8a398"
                                }, {
                                    CalnendarText: "Steven",
                                    id: 2,
                                    CalendarColor: "#56ca95"
                                }],
                                text: "calnedarText",
                                id: "id",
                                color: "calendarColor"
                            }
                        }],
                    });                            
            }
        }
        e.result = scheduleData;
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

    async componentDidMount() {    

        
        getEventList('primary')
            .then(result => {
                this.dataManger = result.result;                

            })
            .catch(error => {
                console.log('error ->', error);
            }); 

        this.getCalendarList();      
    }

    componentWillUnmount() {
        window.removeEventListener(
            'GetUserFromLexonConnector',
            this.handleGetUserFromLexonConnector
        );
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
      args.navigation.enable = true;
    }

    onPopupOpen(args) {
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
                if (args.data.occurrence != undefined) {
                    var d = new Date(args.data.occurrence.StartTime);
                    var dateString = moment(d).seconds(0).toISOString().split('.')[0] + "Z";
                    var ExcRecurenceDate = dateString.replace(/[:.-]/g, "");
                    itemToModify = args.data.parent.Id + '_' + ExcRecurenceDate;   
                    event = this.buildEventoGoogle(args.data.occurrence);
                }
                if (args.changedRecords[0] != undefined) {                   
                    itemToModify = args.changedRecords[0].Id;
                    event = this.buildEventoGoogle(args.changedRecords[0]);
                }

                //call function to update event
                updateCalendarEvent("primary", itemToModify, event)
                    .then(result => {
                        this.loadCalendarEvents(this.defaultCalendar);
                    })
                    .catch(error => {
                        console.log('error ->', error);
                    })
                
                break;

            case 'eventCreated':
               
                event = this.buildEventoGoogle(args.data[0]);

                //call function to add event
                addCalendarEvent("primary",event)
                    .then(result => {                       
                        this.loadCalendarEvents(this.defaultCalendar);
                    })
                    .catch(error => {
                        console.log('error ->', error);
                    }) 

                break;

            case 'eventRemoved':
                //call function to delete event
                let item = args.data[0].Id
                if (args.data[0].occurrence != undefined) {
                    var d = new Date(args.data[0].occurrence.StartTime);                   
                    var dateString = moment(d).seconds(0).toISOString().split('.')[0] + "Z";
                    var ExcRecurenceDate = dateString.replace(/[:.-]/g, "");
                    item = args.data[0].parent.Id + '_' + ExcRecurenceDate; 
                   // item = args.data[0].parent.Id + '_' + args.data[0].parent.RecurrenceException; 
                }

                deleteCalendarEvent("primary", item)
                    .then(result => {
                        this.loadCalendarEvents(this.defaultCalendar);
                    })
                    .catch(error => {
                        console.log('error ->', error);
                    })

                break;
        }

    }

    loadCalendarEvents(calendar) {        
        this.scheduleObj.showSpinner();
        getEventList(calendar)
            .then(result => {
                this.dataManger = result.result;
                
               // this.data = extend([], this.dataManger, null, true);
               // this.onDataBinding(this.dataManger);
                this.scheduleObj.refreshEvents();  
                //this.scheduleObj.refresh();
               
            })
            .catch(error => {
                console.log('error ->', error);
            }) 

        this.defaultCalendar = calendar;
        this.props.selectCalendar(calendar); 
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


    getCalendarList() {
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
                            getCalendarList={this.getCalendarList}
                            pathname={this.props.location.pathname}
                            calendarResult={this.props.calendarsResult}
                            onCalendarClick={this.loadCalendarEvents}
                            onSidebarCloseClick={this.handleShowLeftSidebarClick}
                            onCalendarChange={this.handleScheduleDate}
                            onCalendarOpenEditor={this.handleScheduleOpenEditor}
                    />
                        <article className='d-flex flex-column position-relative'>
                            {/*<Switch>*/}
                            {/*popupOpen={this.onPopupOpen.bind(this)}*/}
                                <div className='schedule-control-section'>
                                    <div className='col-lg-12 control-section'>
                                        <div className='control-wrapper'>
                                            <ScheduleComponent ref={schedule => this.scheduleObj = schedule} width='100%'                                               
                                                actionComplete={this.onEventRendered.bind(this)}
                                                currentView="Month"
                                                height='650px' 
                                                popupOpen={this.onPopupOpen.bind(this)}
                                                eventSettings={{ dataSource: this.dataManger }} dataBinding={this.onDataBinding.bind(this)} dragStart={(this.onEventDragStart.bind(this))}>
                                                <ViewsDirective>
                                                    <ViewDirective option='Day' />
                                                    <ViewDirective option='Week' />
                                                    <ViewDirective option='WorkWeek' />
                                                    <ViewDirective option='Month' />
                                                    <ViewDirective option='Agenda' />
                                                </ViewsDirective>
                                                <ResourcesDirective>
                                                    <ResourceDirective field='CalendarId' title='My Calendars' name='Calendars' allowMultiple={false} dataSource={this.resourceData} textField='Text' idField='Id' colorField='Color'>
                                                    </ResourceDirective>
                                                </ResourcesDirective>
                                                <Inject services={[Day, Week, WorkWeek, Month, Agenda, Resize, DragAndDrop]} />
                                            </ScheduleComponent>
                                        </div>
                                    </div>                                   
                                </div>
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


