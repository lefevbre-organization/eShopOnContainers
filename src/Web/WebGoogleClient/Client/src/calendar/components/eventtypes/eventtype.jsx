import * as React from "react";
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { ButtonComponent, ChangeEventArgs as CheckBoxChange } from '@syncfusion/ej2-react-buttons';
import { ToastComponent } from '@syncfusion/ej2-react-notifications';
import i18n from 'i18next';
import { ListViewComponent } from '@syncfusion/ej2-react-lists';
import { ComboBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import { getEventTypes, addorUpdateEventType, deleteEventType} from "../../../api/accounts";
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
            updatemode: false,
            newmode: false,
            idEvent:undefined,
        }; 

        this.position = { X: 'Center', Y: 'Bottom' };
         
        this.roundedPaletteColors = {
            'custom1': ['#914150', '#435850', '#b69e70','#5c4b98'
                , '#bc4594', '#d8da62', '#ddc9a2', '#466ab0',
                '#eb9fb3', '#879096', '#dec365', '#68c5c3',]
        };  

      
        this.eventTypeData = [];

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

    beforeRoundedTileRender(args) {
        args.element.classList.add('e-rounded-palette');
    }

    roundedPaletteChange(args) {      
        this.setState({ color: args.currentValue.hex })       
    }

    listTemplate(data) {
        return (
            <div className="text-content"> 
            <span style={{backgroundColor: data.Color, marginRight: '20px'}} className='dot'></span>
            {data.Text} 
            <span className="listicons lf-icon-close-round" onClick={this.deleteEventType.bind(this)} />
            <span className="listicons lf-icon-edit" onClick={this.onModifyEventTypeState.bind(this)} />
            <span className='id hidden'>{data.Id}</span>
            </div>
        );        
    }  

    onModifyEventTypeState(args) {
        this.setState({ updatemode: true })
        let idEventType = args.target.parentElement.lastChild.innerText   
        if (idEventType == undefined) {
            if (this.state.idEvent != undefined || this.state.idEvent != "") {
                idEventType = this.state.idEvent
            }
        }
        var itemE = this.eventTypeData.find(function (e) {
            return e.Id == idEventType
        })
        this.setState({ name: itemE.Text });
        this.setState({ color: itemE.Color });
        this.setState({ idEvent: itemE.Id });       
        
    }

    newState() {
        this.setState({ idEvent: undefined});
       this.setState({ newmode: true });
       this.setState({ name: undefined });
       this.setState({ color: undefined });
    }

    cancelState() {
       this.setState({ updatemode: false })
       this.setState({ newmode: false })
    }

    updateState() {
       this.setState({ updatemode: false })
       this.setState({ newmode: false })
    }

    deleteEventType(args) {
        args.stopPropagation();
        let liItem = args.target.parentElement.parentElement;
        this.listEventType.removeElement(liItem);
        function remove(array, element) {
            return array.filter(el => el.Text + el.Id !== element);
        }
        let vowels = remove(this.eventTypeData, args.target.parentElement.innerText);
        this.eventTypeData = [];
        this.eventTypeData = vowels;

        let email = this.props.googleUser.getBasicProfile().getEmail();      
        let dataEventTypeAPI = {            
            "idEvent": args.target.parentElement.lastChild.innerText,
             "email": email
        }

        deleteEventType(dataEventTypeAPI)
            .then(result => { 
                this.toastObj.hide('All');
                this.toastObj.timeOut = 1000;
                this.toastObj.show(this.toasts[1]);
                this.props.getlistEventTypes();
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

    AddorUpdateEventType(args) {

        this.state.name = this.TitleTypeEventObj.value;

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


        let dataEventTypeAPI = [];
        let email = this.props.googleUser.getBasicProfile().getEmail();      
        if (this.state.idEvent != undefined) {
            dataEventTypeAPI = {
                "email": email,
                "eventType":
                {
                    "idEvent": this.state.idEvent,
                    "name": this.TitleTypeEventObj.value,
                    "color": this.state.color
                }
            } 
        }
        else {
           
            dataEventTypeAPI = {
                "email": email,
                "eventType":
                {                  
                    "name": this.TitleTypeEventObj.value,
                    "color": this.state.color
                }
            } 

        }  
        
      
        addorUpdateEventType(dataEventTypeAPI)
            .then(result => {  

                if (result.errors.length > 0) {
                    if (result.errors[0].errorcode = 'EventExist') {
                        this.toastObj.show(this.toasts[3]);
                        return;
                    }
                    else {
                        throw true
                    }                   
                }

                dataEventType = []

                dataEventType = {
                    "Id": result.data.idEvent,
                    "Text": this.TitleTypeEventObj.value,
                    "Color": this.state.color
                }
                    
                this.toastObj.timeOut = 1000;
                this.toastObj.show(this.toasts[1]);

                if (this.state.idEvent != undefined) {
                    //modify current event type
                    let IdEvent = this.state.idEvent;
                    var item = this.eventTypeData.find(function (e) {
                        return e.Id == IdEvent
                    })
                    item.Text = this.TitleTypeEventObj.value;                   
                    item.Color = this.state.color                
                }
                else {
                    //new event type
                    this.eventTypeData.push(dataEventType);
                }
               
                this.setState({ updatemode: false })
                this.setState({ newmode: false })
                this.setState({ idEvent: undefined })             

                this.props.getlistEventTypes();

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

    onPressActionButton(args) { 
        switch (args.target.id) {           
            case 'newevent': 
                this.newState();
                return;           
            case 'cancel':
                this.cancelState();
                return;           
            default:
                return ;
        }
    }

    onDataBinding(items) {
        if (items.length > 0) {
            for (let i = 0; i < items.length; i++) {
                let evt = items[i];                 
                this.eventTypeData.push({                   
                    Id: evt.idEvent,
                    Text: evt.name,
                    Color: evt.color,                   
                });
            }
        }
        this.listEventType.refresh();
    }

    getlistEventTypes() {
        let email  = this.props.googleUser.getBasicProfile().getEmail();
        getEventTypes(email)
            .then(result => {
                this.onDataBinding(result.data.eventTypes)
            })
            .catch(error => {
                console.log('error ->', error);
            });
    }

    componentDidMount() {      
     this.getlistEventTypes();       
    }    

    componentDidUpdate() {
        if (this.state.updatemode) {
            this.colorObj.value = this.state.color;    
            //if (this.TitleTypeEventObj.value != undefined) {
                this.TitleTypeEventObj.value = this.state.name;
            //}           
        }
        else {
            if (!this.state.newmode) { this.listEventType.dataSource = this.eventTypeData}           
        }
    }  

    CheckEnterKey() {
        this.state.name = this.TitleTypeEventObj.value;
    }    

    render() {  
        var ObjId;
        var ObjText;
       
        if (this.state.newmode) {
            ObjId = "newevent";
            ObjText = i18n.t("eventtype.add");
          
        }
        else {
            ObjId = "updateevent";
            ObjText = i18n.t("eventtype.modify");
           
        }
        return (  
            <div className="row custom-margin custom-padding-5 material2">
                <div className="col-xs-12 col-sm-12 col-lg-12 col-md-12">                   
                    {this.state.updatemode || this.state.newmode ? (
                            <div>
                                <div className="form-group">
                                    <div className="e-float-input">
                                    <TextBoxComponent
                                            change={this.CheckEnterKey.bind(this)}
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
                                       id="newevent"                                       
                                        cssClass='e-control e-btn e-lib e-primary e-event-save e-flat'
                                        onClick={this.AddorUpdateEventType.bind(this)}
                                        ref={(scope) => { this.addBtn = scope }}
                                    > {ObjText}</ButtonComponent>

                                   
                                    <ButtonComponent
                                        id="cancel"                                        
                                        cssClass='e-control e-btn e-lib e-event-cancel e-flat'
                                        onClick={this.onPressActionButton.bind(this)}
                                        ref={(scope) => { this.cancelBtn = scope }}
                                     > {i18n.t("eventtype.cancel")}</ButtonComponent>
                                    
                                </div>                              

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
                                        id="newevent"                                       
                                        cssClass='e-control e-btn e-lib e-primary e-event-save e-flat'
                                        onClick={this.onPressActionButton.bind(this)}
                                        ref={(scope) => { this.addBtn = scope }}
                                    > {i18n.t("eventtype.newevent")}</ButtonComponent>                                    
                                </div>
                            </div>
                        )}
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

export default Eventtype;




