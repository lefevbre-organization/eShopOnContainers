import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import {
    ScheduleComponent, ViewsDirective, ViewDirective,
    Day, Week, WorkWeek, Month, Agenda, Inject, Resize, DragAndDrop, DragEventArgs
} from '@syncfusion/ej2-react-schedule';
//import './schedule-component.css';
import { DataManager, WebApiAdaptor } from '@syncfusion/ej2-data';
import { CheckBoxComponent } from '@syncfusion/ej2-react-buttons';
import { getEventList } from '../../api/calendar-api';


export class CalendarCard extends Component {
    constructor(props) {
        super(props);

        this.onCalendarChange = this.onCalendarChange.bind(this);

        this.dataManger = new DataManager(); 

        getEventList('primary')
            .then(result => {
                this.dataManger = result.result;

                this.onDataBinding(this.dataManger);
                this.scheduleObj.refreshEvents();

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
                            StartTime: new Date(start+1),
                            EndTime: new Date(end),
                            IsAllDay: !event.start.dateTime
                        });
                    }
                    this.scheduleObj.addResource(scheduleData, 'calendar', 1);
                    this.scheduleObj.refreshEvents();
                }
               
               
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

    onCalendarChange(args) {
        let value = parseInt(args.event.target.getAttribute('value'), 10);
        if (args.checked) {
            this.scheduleObj.addResource(this.dataManger, 'items', value - 1);
        }
        else {
            this.scheduleObj.removeResource(value, 'Calendars');
        }
    }
  
    render() {
        return (
            <div className='schedule-control-section'>
                <div className='col-lg-12 control-section'>
                    <div className='control-wrapper'>
                        <ScheduleComponent ref={schedule => this.scheduleObj = schedule} width='100%'
                            height='650px' currentView="Day"
                            readonly={true}
                            eventSettings={{ dataSource: this.dataManger }} dataBinding={this.onDataBinding.bind(this)}>
                            <ViewsDirective>
                                <ViewDirective option='Day' />                               
                                <ViewDirective option='Agenda' />                               
                            </ViewsDirective>
                            <Inject services={[Day, Agenda, Resize, DragAndDrop]} />
                        </ScheduleComponent>
                    </div>
                </div>

                {/* <div className='col-lg-3 property-section'>
                    <table id='property' title='Show / Hide Resource' className='property-panel-table' style={{ width: '100%' }}>
                        <tbody>
                            <tr style={{ height: '50px' }}>
                                <td style={{ width: '100%' }}>
                                    <CheckBoxComponent value='1' id='personal' cssClass='personal' checked={true} label='My Calendar' disabled={true} change={this.onCalendarChange.bind(this)}></CheckBoxComponent>
                                </td>
                            </tr>
                            <tr style={{ height: '50px' }}>
                                <td style={{ width: '100%' }}>
                                    <CheckBoxComponent value='2' id='company' cssClass='company' checked={false} label='Company' change={this.onCalendarChange.bind(this)}></CheckBoxComponent>
                                </td>
                            </tr>
                            <tr style={{ height: '50px' }}>
                                <td style={{ width: '100%' }}>
                                    <CheckBoxComponent value='3' id='birthdays' cssClass='birthday' checked={false} label='Birthday' change={this.onCalendarChange.bind(this)}></CheckBoxComponent>
                                </td>
                            </tr>
                            <tr style={{ height: '50px' }}>
                                <td style={{ width: '100%' }}>
                                    <CheckBoxComponent value='4' id='holidays' cssClass='holiday' checked={false} label='Holiday' change={this.onCalendarChange.bind(this)}></CheckBoxComponent>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                </div>*/}
            </div>

           
 

        );
    }
}

 

export default CalendarCard;



