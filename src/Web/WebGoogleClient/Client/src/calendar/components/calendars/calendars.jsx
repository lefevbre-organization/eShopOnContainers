import * as React from "react";
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { ButtonComponent, ChangeEventArgs as CheckBoxChange } from '@syncfusion/ej2-react-buttons';
import { getCalendar, addCalendar, updateCalendar } from "../../../api/calendar-api";
import { ToastComponent } from '@syncfusion/ej2-react-notifications';
import { Acl } from './acl/acl';


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
            { content: 'Processing', cssClass: 'e-toast-black', icon: '' },
            { content: 'Process complete', cssClass: 'e-toast-black', icon: '' },
            { content: 'Error', cssClass: 'e-toast-danger', icon: 'e-error toast-icons' }
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
        addCalendar(calendar)
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

        if (this.props.calendarId != "") {
            this.setState({ hideAddCalendarButton: true });
            getCalendar(this.props.calendarId)
                .then(result => {
                    this.nameObj.value = result.summary;
                    if (result.description !== undefined) {
                        this.descriptionObj.value = result.description;
                    }
                })
                .catch(error => {
                    console.log('error ->', error);
                });           
        }
    }

    render() {
        var ObjClick;
        var ObjText;
        if (this.props.calendarId != '') {
            ObjClick = this.onModifyClick
            ObjText = 'Modify'
        }
        else {
            ObjClick = this.onAddClick
            ObjText = 'Add Calendar'
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
                                            placeholder="Name"
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
                                            placeholder="Description"
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

                                    <h4 className="e-dlg-header">Share with people</h4>
                                    <Acl calendarId={this.state.calendarid} />                                   

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
                                            cssClass='e-primary'
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




