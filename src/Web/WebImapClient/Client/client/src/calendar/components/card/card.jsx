import React, { Component, Fragment } from 'react';
import {
    ScheduleComponent, ViewsDirective, ViewDirective,
    Day, Week, WorkWeek, Month, Agenda, Inject, Resize, DragAndDrop, DragEventArgs, ResourcesDirective, ResourceDirective,
} from '@syncfusion/ej2-react-schedule';
//import './schedule-component.css';
import { DataManager } from '@syncfusion/ej2-data';
import { getEventList } from '../../../api/calendar-api';
import moment from 'moment';



export class Card extends Component {
    constructor(props) {
        super(props);
        this.onCalendarChange = this.onCalendarChange.bind(this);
        this.dataManger = new DataManager(); 
        this.resourceCalendarData = [];  

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
        let calendarId = "primary"
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
                try {
                    scheduleData.push({
                        Id: event.id,
                        CalendarId: calendarId,
                        Subject: event.summary,
                        Location: event.location,
                        Description: event.description,
                        StartTime: new Date(start),
                        EndTime: new Date(end),
                        IsAllDay: !event.start.dateTime,
                        RecurrenceRule: recurrenceRule                       
                    });
                }
                catch (error){
                    console.error(error);
                }               
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

    onPopupOpen(args) {  
        args.cancel = true;
        window.open("calendar", "_blank");  
    }

    doubleOpen(args) {
        args.cancel = true;
        window.open("calendar", "_blank");       
    }
  
    render() {
        return (
            <div className='schedule-control-section'>
                <div className='col-lg-12 control-section'>
                    <div className='control-wrapper'>
                        <ScheduleComponent ref={schedule => this.scheduleObj = schedule} width='100%'
                            height='650px' currentView="Day"
                            readonly={false}
                            popupOpen={this.onPopupOpen.bind(this)} 
                            cellDoubleClick={this.doubleOpen.bind(this)}                            
                            eventSettings={{ dataSource: this.dataManger }} dataBinding={this.onDataBinding.bind(this)}>
                            <ViewsDirective>
                                <ViewDirective option='Day' />                               
                                <ViewDirective option='Agenda' />                               
                            </ViewsDirective>
                            <Inject services={[Day, Agenda, Resize, DragAndDrop]} />
                            <ResourcesDirective>
                                <ResourceDirective field='CalendarId' title='My Calendars' name='Calendars' allowMultiple={false} dataSource={this.resourceCalendarData} textField='summary' idField='id' colorField='backgroundColor'>
                                </ResourceDirective>
                            </ResourcesDirective>
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

export default Card;



