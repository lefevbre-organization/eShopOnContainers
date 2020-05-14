import * as React from "react";
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { ButtonComponent, RadioButtonComponent, ChangeEventArgs as CheckBoxChange } from '@syncfusion/ej2-react-buttons';
import { ComboBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import { ListViewComponent } from '@syncfusion/ej2-react-lists';
import { getCalendarList, getCalendar, addCalendar, updateCalendar, addACL, listACL, deleteACL } from "../../../api/calendar-api";
import { ToastComponent, ToastCloseArgs } from '@syncfusion/ej2-react-notifications';
import './calendarview.scss';

export class CalendarView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            calendarid: this.props.calendarToEdit,
            hideAddCalendarButton: false,
        };
        this.onAddClick = this.onAddClick.bind(this);
        this.onModifyClick = this.onModifyClick.bind(this);
        this.onAddPermission = this.onAddPermission.bind(this);
        this.getlistACL = this.getlistACL.bind(this);


        this.toasts = [
            { content: 'Processing' },
            { content: 'Process complete', cssClass: 'e-toast-success', icon: 'e-success toast-icons' },
            { content: 'Error', cssClass: 'e-toast-danger', icon: 'e-error toast-icons' }
        ]
        this.position = { X: 'Center', Y: 'Bottom' };


        this.roleData = [
            { "Id": "freeBusyReader", "Role": "freeBusyReader" },
            { "Id": "reade", "Role": "reader" },
            { "Id": "writer", "Role": "writer" },
            { "Id": "owner", "Role": "owner" }
        ];
        this.temp = 'roleData';
        this.fields = { text: 'Role', value: 'Id' };
        this.value = "reader";

        this.listviewInstance = null;
        // define the array of Json
        this.dataACLSource = [];
        this.fieldsList = { text: "text", iconCss: "icon" };

    }

    toastCusAnimation = {
        //hide: { effect: 'SlideBottomOut' },
        show: { effect: 'SlideBottomIn' }
    };

    onAddClick(args) {
        this.setState({ buttonDisabled: true })

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

        this.toastObj.showProgressBar = true
        this.toastObj.show(this.toasts[0]);
        addACL(this.state.calendarid, aclData)
            .then(result => {
                console.log(result)
                this.toastObj.hide('All');
                this.toastObj.showProgressBar = false
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
                this.toastObj.showProgressBar = false
                this.toastObj.hide('All');
                this.toastObj.show(this.toasts[2]);
                this.addBtn.properties.disabled = false
                this.setState({ buttonDisabled: false })
            });
    }

    onDataBinding(items) {
        if (items.length > 0) {
            for (let i = 0; i < items.length; i++) {
                let acl = items[i];

                this.dataACLSource.push({
                    text: acl.scope.value,
                    id: acl.id,
                    role: acl.role,
                    icon: "delete-icon"
                });
            }
        }
        // this.listviewInstance = this.dataACLSource;
        this.listviewInstance.refresh();
        // this.listviewInstance.refreshChild();
    }

    getlistACL() {
        listACL(this.state.calendarid)
            .then(result => {
                this.onDataBinding(result.items)
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
                <span className="delete-icon" onClick={this.deleteItem.bind(this)} />
            ) : (
                    ''
                )}

        </div>);
    }

    deleteItem(args) {
        args.stopPropagation();
        let liItem = args.target.parentElement.parentElement;

        this.toastObj.showProgressBar = true
        this.toastObj.show(this.toasts[0]);
        deleteACL(this.state.calendarid, liItem.dataset.uid)
            .then(result => {
                this.toastObj.hide('All');
                this.toastObj.showProgressBar = false
                this.toastObj.show(this.toasts[1]);
                this.listviewInstance.removeItem(liItem);
            })
            .catch(error => {
                console.log('error ->', error);
                this.toastObj.showProgressBar = false
                this.toastObj.hide('All');
                this.toastObj.show(this.toasts[2]);

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

            this.getlistACL();
        }
    }

    onChange() {
        let value = document.getElementById('value');
        let text = document.getElementById('text');
        //value.innerHTML = this.permissionObj.value === null ? 'null' : this.permissionObj.value.toString();
        //text.innerHTML = this.permissionObj.text === null ? 'null' : this.permissionObj.text;
    }

    rendereComplete() {
        this.onChange();
    }

    render() {

        var ObjClick;
        var ObjText;
        if (this.props.calendarToEdit != '') {
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
                                    <ListViewComponent
                                        id="sample-list"
                                        dataSource={this.dataACLSource}
                                        fields={this.fieldsList}
                                        template={this.listTemplate.bind(this)} ref={listview => {
                                            this.listviewInstance = listview;
                                        }} />

                                    {/*<ButtonComponent id="btn" onClick={this.addItem.bind(this)}>
                                        Add Item
                                    </ButtonComponent>*/}


                                    <div className="row">
                                        <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6">
                                            <div className="form-group">
                                                <div className="e-float-input">
                                                    <TextBoxComponent
                                                        id='mail'
                                                        placeholder="Mail address"
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
                                                        placeholder="Permissions"
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




