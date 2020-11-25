import * as React from "react";
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { ButtonComponent, ChangeEventArgs as CheckBoxChange } from '@syncfusion/ej2-react-buttons';
import { ToastComponent } from '@syncfusion/ej2-react-notifications';
import i18n from 'i18next';
import { ListViewComponent } from '@syncfusion/ej2-react-lists';
import { ComboBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import { getEventTypes, addorUpdateEventType, deleteEventType} from "../../../api/accounts";
import { ColorPickerComponent } from '@syncfusion/ej2-react-inputs';
import LexonComponentCalendar from '../../../apps/lexon_content_calendar';
import './events.scss';


export class EventsImport extends React.Component {
    constructor(props) {
        super(props);

        this.toasts = [
            { content: i18n.t("schedule.toast-processing"), cssClass: 'e-toast-black', icon: '' },
            { content: i18n.t("schedule.toast-process-complete"), cssClass: 'e-toast-black', icon: '' },
            { content: i18n.t("schedule.toast-process-error"), cssClass: 'e-toast-danger', icon: 'e-error toast-icons' },
            { content: i18n.t("schedule.toast-process-error-exist"), cssClass: 'e-toast-danger', icon: 'e-error toast-icons' }
        ] 
    }

    toastCusAnimation = {
        hide: { duration: '1' },
        show: {  duration: '200' }
    };
       

    componentDidMount() {      
       
    }    

    onPressActionButton() {

    }

    componentDidUpdate() {
        //if (this.state.updatemode) {
        //    this.colorObj.value = this.state.color;    
        //    //if (this.TitleTypeEventObj.value != undefined) {
        //        this.TitleTypeEventObj.value = this.state.name;
        //    //}           
        //}
        //else {
        //    if (!this.state.newmode) { this.listEventType.dataSource = this.eventTypeData}           
        //}
    }  

    CheckEnterKey() {
        this.state.name = this.TitleTypeEventObj.value;
    }    

    render() {
        debugger;
        return (  
            <div className="row custom-margin custom-padding-5 material2">
                <div className="col-xs-12 col-sm-12 col-lg-12 col-md-12"> 
                    <div className="Ccontainer" >
                        <LexonComponentCalendar />
                            <div className="e-footer-content">
                                <ButtonComponent
                                    id="newevent"
                                    cssClass='hidden e-control e-btn e-lib e-primary e-event-save e-flat'
                                    onClick={this.onPressActionButton.bind(this)}
                                    ref={(scope) => { this.addBtn = scope }}
                                > Aceptar</ButtonComponent>
                            </div>
                        </div>
                       
                    <ToastComponent ref={(toast) => { this.toastObj = toast; }}
                        id='toast_pos'
                        content='Action successfully completed.'
                        position={this.position}
                        target={this.target}
                        animation={this.toastCusAnimation}
                        timeOut={2000}
                    >
                    </ToastComponent>

                </div>
            </div>
        )
    }
}

export default EventsImport;




