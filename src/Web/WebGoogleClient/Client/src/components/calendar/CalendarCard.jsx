import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import {
    ScheduleComponent, ViewsDirective, ViewDirective,
    Day, Week, WorkWeek, Month, Agenda, Inject, Resize, DragAndDrop, DragEventArgs
} from '@syncfusion/ej2-react-schedule';
//import './schedule-component.css';
import { DataManager, WebApiAdaptor } from '@syncfusion/ej2-data';


export class CalendarCard extends Component {
    constructor(props) {
        super(props);

        //super(...arguments);
        this.calendarId = '5105trob9dasha31vuqek6qgp0@group.calendar.google.com';
        this.publicKey = 'AIzaSyD76zjMDsL_jkenM5AAnNsORypS1Icuqxg';
        //AIzaSyBeFMkCiP0Ld2ExOsvAhksK0AsRqtmD1XQ
        this.dataManger = new DataManager({
            url: 'https://www.googleapis.com/calendar/v3/calendars/' + this.calendarId + '/events?key=' + this.publicKey,
            adaptor: new WebApiAdaptor,
            crossDomain: true
        });      
    }


    onDataBinding(e) {

        let items = e.result.items;
        let scheduleData = [];
        if (items.length > 0) {
            for (let i = 0; i < items.length; i++) {
                let event = items[i];
                let when = event.start.dateTime;
                let start = event.start.dateTime;
                let end = event.end.dateTime;
                if (!when) {
                    when = event.start.date;
                    start = event.start.date;
                    end = event.end.date;
                }
                scheduleData.push({
                    Id: event.id,
                    Subject: event.summary,
                    StartTime: new Date(start),
                    EndTime: new Date(end),
                    IsAllDay: !event.start.dateTime
                });
            }
        }
        e.result = scheduleData;
    }

    render() {
        return (
            <div className='schedule-control-section'>
                <div className='col-lg-12 control-section'>
                    <div className='control-wrapper'>
                        <ScheduleComponent ref={schedule => this.scheduleObj = schedule} width='100%'
                            height='650px' selectedDate={new Date(2018, 10, 14)} currentView="Day"
                            eventSettings={{ dataSource: this.dataManger }} dataBinding={this.onDataBinding.bind(this)}>
                            <ViewsDirective>
                                <ViewDirective option='Day' />
                                <ViewDirective option='Week' />
                                <ViewDirective option='WorkWeek' />
                                <ViewDirective option='Month' />
                                <ViewDirective option='Agenda' />
                            </ViewsDirective>
                            <Inject services={[Day, Week, WorkWeek, Month, Agenda, Resize, DragAndDrop]} />
                        </ScheduleComponent>
                    </div>
                </div>
            </div>    
        );
    }
}

 

export default CalendarCard;



