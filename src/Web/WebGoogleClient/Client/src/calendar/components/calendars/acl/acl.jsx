import * as React from "react";
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { ListViewComponent } from '@syncfusion/ej2-react-lists';
import { addAcl, listAcl, deleteAcl } from "../../../../api/calendar-api";
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { ComboBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import { ToastComponent } from '@syncfusion/ej2-react-notifications';
import i18n from 'i18next';
import '../calendars.scss';


export class Acl extends React.Component {
    constructor(props) {
        super(props);
        this.listviewInstance = null;
        this.position = { X: 'Center', Y: 'Bottom' };        
        this.temp = 'roleData';
        this.fields = { text: 'Role', value: 'Id' };
        this.value = "reader";
        this.listviewInstance = null;     
        this.dataACLSource = [];
        this.fieldsList = { text: "text", iconCss: "icon" };
        this.onAddPermission = this.onAddPermission.bind(this);
        this.getlistAcl = this.getlistAcl.bind(this);
       

        this.state = {
            calendarid: this.props.calendarId
        };

        this.toasts = [
            { content: i18n.t("schedule.toast-processing"), cssClass: 'e-toast-black', icon: '' },
            { content: i18n.t("schedule.toast-process-complete"), cssClass: 'e-toast-black', icon: '' },
            { content: i18n.t("schedule.toast-process-error"), cssClass: 'e-toast-danger', icon: 'e-error toast-icons' }
        ]

        this.roleData = [
            { "Id": "freeBusyReader", "Role": "freeBusyReader" },
            { "Id": "reade", "Role": "reader" },
            { "Id": "writer", "Role": "writer" },
            { "Id": "owner", "Role": "owner" }
        ];
    }

    toastCusAnimation = {
        hide: { duration: '1' },
        show: { duration: '200' }
    };

    onAddPermission(args) {
        let id = "user:" + this.mailaccountObj.value;
        let aclData = {
            "role": this.permissionObj.value,
            "scope":
            {
                "type": "user",
                "value": this.mailaccountObj.value
            },
            "kind": "calendar#aclRule",
            "id": id
        }

        this.toastObj.timeOut = 10000;
        this.toastObj.showProgressBar = true;
        this.toastObj.show(this.toasts[0]);
        addAcl(this.state.calendarid, aclData)
            .then(result => {

                this.toastObj.hide('All');
                this.toastObj.showProgressBar = false;
                this.toastObj.timeOut = 1000;
                this.toastObj.show(this.toasts[1]);


                let dataPermission = {
                    text: this.mailaccountObj.value,
                    role: this.permissionObj.value,
                    id: id,
                    icon: "delete-icon"
                };
                this.listviewInstance.addItem([dataPermission]);

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

    deleteItem(args) {
        args.stopPropagation();
        let liItem = args.target.parentElement.parentElement;

        this.toastObj.timeOut = 10000;
        this.toastObj.showProgressBar = true
        this.toastObj.show(this.toasts[0]);
        deleteAcl(this.state.calendarid, liItem.dataset.uid)
            .then(result => {
                this.toastObj.hide('All');
                this.toastObj.showProgressBar = false
                this.toastObj.timeOut = 1000;
                this.toastObj.show(this.toasts[1]);
                this.listviewInstance.removeItem(liItem);
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

    onChange() {
        let value = document.getElementById('value');
        let text = document.getElementById('text');
    }

    onDataBinding(items) {
        if (items.length > 0) {
            for (let i = 0; i < items.length; i++) {
                if(
                    items[i].id.split('@')[1] === 'group.calendar.google.com'
                ) {
                    i = 1;
                }
                let acl = items[i];

                this.dataACLSource.push({
                    text: acl.scope.value,
                    id: acl.id,
                    role: acl.role,
                    icon: "delete-icon"
                });
            }
        }
        this.listviewInstance.refresh();
    }

    getlistAcl() {
        listAcl(this.state.calendarid)
            .then(result => {
                this.onDataBinding(result)
            })
            .catch(error => {
                console.log('error ->', error);
            });
    }

    listTemplate(data) {
        let owner = false
        if (data.role == "owner") {
            owner = true
        }

        return (<div className="text-content">
            {data.text} ({data.role})
             {!owner ? (
                <span className="listicons lf-icon-close-round" onClick={this.deleteItem.bind(this)} />
            ) : (
                    ''
                )}

        </div>);
    }  

    componentDidMount() {       
      this.getlistAcl();        
    }

   render() {
       return (<div>
           <label id="label_name" for="name">{i18n.t("calendar-sidebar.permission")}</label>
            <ListViewComponent
                id="sample-list"
                dataSource={this.dataACLSource}
                fields={this.fieldsList}
                template={this.listTemplate.bind(this)} ref={listview => {
                    this.listviewInstance = listview;
                }} />

            <div className="row">
                <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6">
                    <div className="form-group">
                        <div className="e-float-input">
                            <TextBoxComponent
                                id='mail'
                                placeholder={i18n.t("acl.emailaddresses")}
                                floatLabelType="Always"
                                ref={(scope) => { this.mailaccountObj = scope }}
                            />
                        </div>
                        <div id="noError" />
                    </div>
                </div>
                <div className="col-xs-4 col-sm-4 col-lg-4 col-md-4">
                    <div className="form-group">
                        <div className="e-float-input">
                            <ComboBoxComponent
                                id="roles"
                                floatLabelType="Always"
                                dataSource={this.roleData}
                                ref={(combobox) => { this.permissionObj = combobox; }}
                                fields={this.fields}
                                change={this.onChange.bind(this)}
                                placeholder={i18n.t("acl.permissions")}
                                value={this.value}
                                popupHeight="220px" />
                        </div>
                        <div id="noError" />
                    </div>
                </div>
                <div className="col-xs-2 col-sm-2 col-lg-2 col-md-2">
                    <div className="e-float-input buttonadd">
                        <ButtonComponent
                            cssClass='e-flat e-primary'
                            floatLabelType="Always"
                            onClick={this.onAddPermission}
                        >Add</ButtonComponent>
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
      </div>);
    }
}

export default Acl;



