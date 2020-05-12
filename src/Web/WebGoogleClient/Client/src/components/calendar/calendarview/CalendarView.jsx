import * as React from "react";
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { ButtonComponent, RadioButtonComponent, ChangeEventArgs as CheckBoxChange } from '@syncfusion/ej2-react-buttons';
import { getCalendarList, getCalendar, addCalendar, updateCalendar } from "../../../api/calendar-api";
import { ToastComponent, ToastCloseArgs } from '@syncfusion/ej2-react-notifications';
import './calendarview.scss';

export class CalendarView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {           
            calendarid: this.props.calendarToEdit,           
            hideAddCalendarButton: false,           
        };  
        this.onAddClick = this.onAddClick.bind(this)
        this.onModifyClick = this.onModifyClick.bind(this)
        this.toasts = [
            { content: 'Processing'},
            { content: 'Process complete', cssClass: 'e-toast-success', icon: 'e-success toast-icons' },
            { content: 'Error', cssClass: 'e-toast-danger', icon: 'e-error toast-icons' }
        ]
        this.position = { X: 'Center', Y: 'Bottom' };       
    }

    toastCusAnimation = {
        //hide: { effect: 'SlideBottomOut' },
        show: { effect: 'SlideBottomIn' }
    };

    onAddClick(args) { 
        this.setState({ buttonDisabled: true } )

        let calendar = {
            "summary": this.nameObj.value,
            "description": this.descriptionObj.value
        }

        this.toastObj.showProgressBar = true
        this.toastObj.show(this.toasts[0]);
        addCalendar(calendar)
            .then(result => {
                console.log(result)
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

    onModifyClick(args) {

        let calendarData = {
            "summary": this.nameObj.value,
            "description": this.descriptionObj.value
        }

        this.toastObj.showProgressBar = true
        this.toastObj.show(this.toasts[0]);
        updateCalendar(this.state.calendarid, calendarData)
            .then(result => {
                console.log(result)
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

        if (this.props.calendarToEdit != "") {
            this.setState({ hideAddCalendarButton: true });
            getCalendar(this.props.calendarToEdit)
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
        if (this.props.calendarToEdit !='') {
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
                                    <div className="row">
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
                                        </div>
                                    </div> 
                            </div> 

                            <ToastComponent ref={(toast) => { this.toastObj = toast; }}
                                id='toast_pos'
                                content='Action successfully completed.'
                                position={this.position}
                                target={this.target}
                                animation={this.toastCusAnimation}
                                timeOut={10000}
                            >
                            </ToastComponent>
                        </div>
                    </div>
                </div>
            </div> 
        )
    }
}

export default CalendarView;




