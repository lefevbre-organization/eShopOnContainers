import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import {
    ScheduleComponent, ViewsDirective, ViewDirective,
    Day, Week, WorkWeek, Month, Agenda, Inject, Resize, DragAndDrop, DragEventArgs
} from '@syncfusion/ej2-react-schedule';
//import './schedule-component.css';
import { DataManager, WebApiAdaptor } from '@syncfusion/ej2-data';
import { getEventList } from '../../api/index';


export class CalendarCard extends Component {
    constructor(props) {
        super(props);

        this.dataManger = new DataManager(); 

        getEventList('primary')
            .then(result => {
                this.dataManger = result.result;

                this.onDataBinding(this.dataManger);
                this.scheduleObj.refreshEvents();
            })
            .catch(error => {
                console.log('error ->', error);
            });

    }


    onDataBinding(e) {
        let items = this.dataManger.items;
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
                            height='650px'  currentView="Day"
                            eventSettings={{ dataSource: this.dataManger }} dataBinding={this.onDataBinding.bind(this)}>
                            <ViewsDirective>
                                <ViewDirective option='Day' />                               
                                <ViewDirective option='Agenda' />
                            </ViewsDirective>
                            <Inject services={[Day, Agenda, Resize, DragAndDrop]} />
                        </ScheduleComponent>
                    </div>
                </div>
            </div>    
        );
    }
}

 

export default CalendarCard;



