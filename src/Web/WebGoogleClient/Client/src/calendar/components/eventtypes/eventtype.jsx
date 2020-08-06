import * as React from "react";
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { ButtonComponent, ChangeEventArgs as CheckBoxChange } from '@syncfusion/ej2-react-buttons';
import { ToastComponent } from '@syncfusion/ej2-react-notifications';
import i18n from 'i18next';
import { ListViewComponent } from '@syncfusion/ej2-react-lists';
import { ComboBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import { getEventTypes, addOrUpdateEventType, deleteEventType } from "../../../api/accounts";
import { ColorPickerComponent } from '@syncfusion/ej2-react-inputs';
import './eventtype.scss';


export class Eventtype extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errorName: "",
            errorColor: "",
            color: undefined,
            name: undefined,
            editmode: false,
            newmode: false,
        }; 

        this.position = { X: 'Center', Y: 'Bottom' };
         
        this.roundedPaletteColors = {
            'custom1': ['#914150', '#435850', '#b69e70','#5c4b98'
                , '#bc4594', '#d8da62', '#ddc9a2', '#466ab0',
                '#eb9fb3', '#879096', '#dec365', '#68c5c3',]
        };  

        //to delete
        this.eventTypeData = [
            { "Id": "1", "Text": "personal", "Color": "#dec365"},
            { "Id": "2", "Text": "meeting", "Color": "#ddc9a2"},
            { "Id": "3", "Text": "gym", "Color": "#bc4594" }          
        ];

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

    beforeRoundedTileRender(args) {
        args.element.classList.add('e-rounded-palette');
    }

    roundedPaletteChange(args) {      
        this.setState({ color: args.currentValue.hex })
    }

    listTemplate(data) {
        return (<div className="text-content"> 
            <span Style={`background-color: ${data.Color}; margin-right: 20px`} className='dot'></span>
            {data.Text} 
            <span className="delete-icon" onClick={this.deleteEventTypem.bind(this)} />
            <span className="delete-icon" onClick={this.onModifyEventTypeState.bind(this)} />
            <span className='id hidden'>{data.Id}</span>
        </div>);
    }  

    onModifyEventTypeState(args) {
        this.setState({ editmode: true })

        let idEventType = args.target.parentElement.lastChild.innerText

       
        var itemE = this.eventTypeData.find(function (e) {
            return e.Id == idEventType
        })
        this.setState({ name: itemE.Text });
        this.setState({ color: itemE.Color });
        //var item = this.listEventType.dataSource.find(function (e) {
        //    return e.Text == args.target.parentElement.innerText
        //})
        //item.Text = "probando"
        //this.listEventType.refresh();
       // alert(item)   
      
        
    }

    onAddNewEvent() {
        this.setState({ newmode: true });
        this.setState({ name: undefined });
        this.setState({ color: undefined });
    }

    onCancelEventType() {
        this.setState({ editmode: false })
        this.setState({ newmode: false })
    }


    onAddEventType(args) {

        if (this.TitleTypeEventObj.value == undefined) {
            this.setState({ errorName: 'Dato obligatorio' })
            return
        }
        else {
            this.setState({ errorName: '' })
        }

        if (this.state.color === undefined) {
            this.setState({ errorColor: 'Debe seleccionar un color' })
            return
        }
        else {
            this.setState({ errorColor: '' })
        }        
      
        let dataEventType = {
            "Id": "id",
            "Text": this.TitleTypeEventObj.value,
            "Color": this.state.color 
        }

        this.toastObj.timeOut = 10000;
        this.toastObj.showProgressBar = true;
        this.toastObj.show(this.toasts[0]);
        addOrUpdateEventType("", "", dataEventType)
            .then(result => {
                this.toastObj.hide('All');
                this.toastObj.showProgressBar = false;
                this.toastObj.timeOut = 1000;
                this.toastObj.show(this.toasts[1]);

                this.eventTypeData.push(dataEventType);
                this.setState({ editmode: false })
                this.setState({ newmode: false })
                //this.listEventType.addItem([dataEventType]);

            })
            .catch(error => {
                console.log('error ->', error);
                if (this.toastObj != undefined) {
                    this.toastObj.showProgressBar = false;
                    this.toastObj.hide('All');
                    this.toastObj.timeOut = 1000;
                    this.toastObj.show(this.toasts[2]);
                }
            });
    }

    deleteEventTypem(args) {
        args.stopPropagation();
        let liItem = args.target.parentElement.parentElement;
        this.listEventType.removeElement(liItem);
        function remove(array, element) {
            return array.filter(el => el.Text !== element);
        }
        let vowels = remove(this.eventTypeData, args.target.parentElement.innerText);
        this.eventTypeData = [];
        this.eventTypeData = vowels;

        //this.toastObj.timeOut = 10000;
        //this.toastObj.showProgressBar = true
        //this.toastObj.show(this.toasts[0]);
        //deleteEventType(this.state.calendarid, liItem.dataset.uid)
        //    .then(result => {
        //        this.toastObj.hide('All');
        //        this.toastObj.showProgressBar = false
        //        this.toastObj.timeOut = 1000;
        //        this.toastObj.show(this.toasts[1]);
        //        this.listEventType.removeItem(liItem);
        //    })
        //    .catch(error => {
        //        console.log('error ->', error);
        //        if (this.toastObj != undefined) {
        //            this.toastObj.showProgressBar = false;
        //            this.toastObj.hide('All');
        //            this.toastObj.timeOut = 1000;
        //            this.toastObj.show(this.toasts[2]);
        //        }
        //    });

    }  

    componentDidUpdate() {
        if (this.state.editmode) {
            this.colorObj.value = this.state.color;
            this.TitleTypeEventObj.value = this.state.name;
        }
    }    

    render() {   

        var ObjClick;
        var ObjText;
        if (this.state.newmode) {
           // ObjClick = this.onModifyClick
            ObjText = i18n.t("eventtype.add")
        }
        else {
           // ObjClick = this.onAddEventType.bind(this)
            ObjText = i18n.t("eventtype.modify")
        }

        return (   

            <div className="row custom-margin custom-padding-5 material2">
                <div className="col-xs-12 col-sm-12 col-lg-12 col-md-12">                   
                    {this.state.editmode || this.state.newmode ? (
                            <div>
                                <div className="form-group">
                                    <div className="e-float-input">
                                        <TextBoxComponent
                                            required='true'                                            
                                            id='name'
                                            placeholder={i18n.t("eventtype.name")}
                                            floatLabelType="Always"
                                            ref={(scope) => { this.TitleTypeEventObj = scope }}
                                        />
                                    </div>
                                    <div className="errormessage" id="nameError">{this.state.errorName}</div>
                                </div>
                                <div className="form-group">
                                    <div className="e-float-input">
                                        <div className='e-rounded-wrap'>
                                            <ColorPickerComponent id='rounded-palette' value={this.state.color} mode='Palette' ref={(scope) => { this.colorObj = scope; }} modeSwitcher={false} inline={true} showButtons={false} columns={4} presetColors={this.roundedPaletteColors} beforeTileRender={this.beforeRoundedTileRender.bind(this)} change={this.roundedPaletteChange.bind(this)}></ColorPickerComponent>
                                        </div>
                                    </div>
                                    <div className="errormessage" id="nameColor">{this.state.errorColor}</div>
                                 </div> 

                                <div className="e-footer-content">
                                    <ButtonComponent
                                        id="actionbutton"
                                        //disabled={this.state.buttonDisabled}
                                        cssClass='e-control e-btn e-lib e-primary e-event-save e-flat'
                                        onClick={this.onAddEventType.bind(this)}
                                        ref={(scope) => { this.addBtn = scope }}
                                     > {ObjText}</ButtonComponent>

                                    <ButtonComponent
                                        id="cancelbutton"
                                        //disabled={this.state.buttonDisabled}
                                        cssClass='e-control e-btn e-lib e-event-cancel e-flat'
                                        onClick={this.onCancelEventType.bind(this)}
                                        ref={(scope) => { this.addBtn = scope }}
                                    > {i18n.t("eventtype.cancel")}</ButtonComponent>
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
                        ) : (
                            <div>
                                <ListViewComponent
                                    id="sample-list"
                                    dataSource={this.eventTypeData}                                    
                                    template={this.listTemplate.bind(this)} ref={listview => {
                                        this.listEventType = listview;
                                    }} />

                                <div className="e-footer-content">
                                    <ButtonComponent
                                        id="neweventbutton"
                                        //disabled={this.state.buttonDisabled}
                                        cssClass='e-control e-btn e-lib e-primary e-event-save e-flat'
                                        onClick={this.onAddNewEvent.bind(this)}
                                        ref={(scope) => { this.addBtn = scope }}
                                    > {i18n.t("eventtype.newevent")}</ButtonComponent>                                    
                                </div>
                            </div>
                            )}
                </div>
            </div>
        )
    }
}

export default Eventtype;




