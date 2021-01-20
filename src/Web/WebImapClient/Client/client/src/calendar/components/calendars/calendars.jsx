import * as React from "react";
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { ButtonComponent, ChangeEventArgs as CheckBoxChange } from '@syncfusion/ej2-react-buttons';
import {createCalendar} from "../../api/calendar-api";
import { ToastComponent } from '@syncfusion/ej2-react-notifications';
//import { Acl } from './acl/acl';
import i18n from 'i18next';


export class Calendars extends React.Component {
    constructor(props) {
        super(props);
        this.position = { X: 'Center', Y: 'Bottom' };
        this.onAddClick = this.onAddClick.bind(this);
        this.onModifyClick = this.onModifyClick.bind(this);

        this.state = {
            calendarid: this.props.calendarId,
            hideAddCalendarButton: false,
        };      

        this.toasts = [
            { content: i18n.t("schedule.toast-processing"), cssClass: 'e-toast-black', icon: '' },
            { content: i18n.t("schedule.toast-process-complete"), cssClass: 'e-toast-black', icon: '' },
            { content: i18n.t("schedule.toast-process-error"), cssClass: 'e-toast-danger', icon: 'e-error toast-icons' }
        ] 
    }

    toastCusAnimation = {
        hide: { duration: '1' },
        show: {  duration: '200' }
    };

    onAddClick(args) {
        this.setState({ buttonDisabled: true })

        let calendar = {
            "summary": this.nameObj.value,
            "description": this.descriptionObj.value
        }

        this.toastObj.showProgressBar = true
        this.toastObj.timeOut = 10000;
        this.toastObj.show(this.toasts[0]);
        createCalendar(calendar)
            .then(result => {
              
                this.toastObj.hide('All');
                this.toastObj.showProgressBar = false
                this.toastObj.timeOut = 1000;
                this.toastObj.show(this.toasts[1]);
                this.setState({ buttonDisabled: false })
                this.props.close();

            })
            .catch(error => {
                console.log('error ->', error);
                this.toastObj.showProgressBar = false
                this.toastObj.hide('All');
                this.toastObj.timeOut = 1000;
                this.toastObj.show(this.toasts[2]);
                this.addBtn.properties.disabled = false
                this.setState({ buttonDisabled: false })
            });
    }

    onModifyClick(args) {

        let calendarData = {
            "summary": this.nameObj.value,
            "description": this.descriptionObj.value
        }

        this.toastObj.showProgressBar = true
        this.toastObj.show(this.toasts[0]);
        updateCalendar(this.state.calendarid, calendarData)
            .then(result => {
               
                this.toastObj.hide('All');
                this.toastObj.showProgressBar = false
                this.toastObj.show(this.toasts[1]);
                this.setState({ buttonDisabled: false })
                this.props.close();

            })
            .catch(error => {
                console.log('error ->', error);
                this.toastObj.showProgressBar = false
                this.toastObj.hide('All');
                this.toastObj.show(this.toasts[2]);
                this.addBtn.properties.disabled = false
                this.setState({ buttonDisabled: false })
            });

    }     

    componentDidMount() {

        //if (this.props.calendarId != "") {
        //    this.setState({ hideAddCalendarButton: true });
        //    getCalendar(this.props.calendarId)
        //        .then(result => {
        //            this.nameObj.value = result.summary;
        //            if (result.description !== undefined) {
        //                this.descriptionObj.value = result.description;
        //            }
        //        })
        //        .catch(error => {
        //            console.log('error ->', error);
        //        });           
        //}
    }

    render() {
        var ObjClick;
        var ObjText;
        if (this.props.calendarId != '') {
            ObjClick = this.onModifyClick          
            ObjText = i18n.t("calendar.modify")            
        }
        else {
            ObjClick = this.onAddClick;
            ObjText = i18n.t("calendar.add")             
        }

        return (
            <div className="row custom-margin custom-padding-5 material2">
                <div className="col-xs-12 col-sm-12 col-lg-12 col-md-12">
                    <div id="formComponents">
                        <div className='validation_wrapper'>
                            <div className="form-horizontal">
                                <div className="form-group">
                                    <div className="e-float-input">
                                        <TextBoxComponent
                                            id='name'
                                            placeholder={i18n.t("calendar.name")}                                           
                                            floatLabelType="Always"
                                            ref={(scope) => { this.nameObj = scope }}
                                        />
                                    </div>
                                    <div id="userError" />
                                </div>
                                <div className="form-group">
                                    <div className="e-float-input">
                                        <TextBoxComponent
                                            id='description'
                                            row="3"
                                            multiline={true}
                                            floatLabelType="Always"
                                            placeholder={i18n.t("calendar.description")} 
                                            ref={(scope) => { this.descriptionObj = scope }}
                                        />
                                    </div>
                                    <div id="noError" />
                                </div>
                                <div>

                                    {/* <div className="row">
                                        <div className="submitRow">
                                            <div style={{ display: 'inline-block' }}>                                                                                                  
                                                    <ButtonComponent
                                                        id="add"
                                                        disabled={this.state.buttonDisabled}
                                                        cssClass='e-primary'
                                                        onClick={ObjClick}
                                                        ref={(scope) => { this.addBtn = scope }}
                                                > {ObjText}</ButtonComponent> 
                                                </div>
                                            </div>
                                    </div>*/}

                                </div>
                            </div>


                            {this.state.hideAddCalendarButton ? (

                                <div >                                 

                                    <h4 className="e-dlg-header">header</h4>
                                    {/*  <h4 className="e-dlg-header">{i18n.t("calendar.sharewithpeople")}</h4>*/}
                                    {/*<Acl calendarId={this.state.calendarid} />*/}                                   

                                </div >
                            ) : (
                                    ''
                                )}

                            <div className="row">
                                <div className="submitRow">
                                    <div style={{ display: 'inline-block' }}>
                                        <ButtonComponent
                                            id="modify"
                                            disabled={this.state.buttonDisabled}
                                            cssClass='e-control e-btn e-lib e-primary e-event-save e-flat'
                                            onClick={ObjClick}
                                            ref={(scope) => { this.addBtn = scope }}
                                        > {ObjText}</ButtonComponent>
                                    </div>
                                </div>
                            </div>

                            <ToastComponent ref={(toast) => { this.toastObj = toast; }}
                                id='toast_pos'
                                content='Action successfully completed.'
                                position={this.position}
                                target={this.target}
                                animation={this.toastCusAnimation}
                                timeOut={1000}
                            >
                            </ToastComponent>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Calendars;




