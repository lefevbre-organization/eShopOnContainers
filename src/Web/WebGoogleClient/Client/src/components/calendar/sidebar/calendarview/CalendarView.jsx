import React, { PureComponent } from "react";
import { DialogComponent } from '@syncfusion/ej2-react-popups';

export class CalendarView extends PureComponent {

  constructor(props) {
    super(props);
      this.onClick = this.onClick.bind(this);

      this.state = {          
          hidePromptDialog: false
      };

      this.promptButtonRef = element => {
          this.promptButtonEle = element;
      };
     
      this.alertButtons = [{
          // Click the footer buttons to hide the Dialog
          click: () => {
              this.setState({ hideAlertDialog: false });
          },
          buttonModel: { content: 'Dismiss', isPrimary: true }
      }];
      this.confirmButton = [{
          click: () => {
              this.setState({ hideConfirmDialog: false });
          },
          buttonModel: { content: 'Yes', isPrimary: true }
      },
      {
          click: () => {
              this.setState({ hideConfirmDialog: false });
          },
          buttonModel: { content: 'No' }
      }];
      this.promptButtons = [{
          click: () => {
              this.setState({ hidePromptDialog: false });
          },
          buttonModel: { content: 'Connect', isPrimary: true }
      },
      {
          click: () => {
              this.setState({ hidePromptDialog: false });
          },
          buttonModel: { content: 'Cancel' }
      }];
      this.animationSettings = { effect: 'None' };

       // this.position = { X: 'Center', Y: 'Center' };

    }

    buttonClick(args) {
        if (args.target.innerHTML.toLowerCase() == 'alert') {
            this.setState({ hideAlertDialog: true });
        }
        else if (args.target.innerHTML.toLowerCase() == 'confirm') {
            this.setState({ hideConfirmDialog: true });
        }
        else if (args.target.innerHTML.toLowerCase() == 'prompt')
            this.setState({ hidePromptDialog: true });
    }
    dialogClose() {
        this.setState({
          
            hidePromptDialog: false
        });
      
        this.promptButtonEle.style.display = 'inline-block';
    }
    dialogOpen() {
        this.promptButtonEle.style.display = 'none';
    }
    onFocus(args) {
        //this.spanEle.classList.add('e-input-focus');
    }
    onBlur(args) {
        //this.spanEle.classList.remove('e-input-focus');
    }


  onClick(evt) { 
      this.props.onClick(evt, this.props.id, this.ownerObj.checked );
  }

  render() {
    //const {name, messagesUnread} = this.props;
    //const iconProps = this.props.iconProps;

    //  let selected = this.props.selected ? " selected" : "";
     
   // const messagesUnreadLocale = messagesUnread.toLocaleString();
      return ( 

         <div>
              <button className="e-control e-btn dlgbtn" ref={this.promptButtonRef} onClick={this.buttonClick.bind(this)} id="promptBtn">Prompt</button>
          <DialogComponent id='dialogDraggable' isModal={true} header='Join Wi-Fi network' visible={this.state.hidePromptDialog} showCloseIcon={true} animationSettings={this.animationSettings} width='330px' ref={dialog => this.promptDialogInstance = dialog} target='#target' buttons={this.promptButtons} open={this.dialogOpen.bind(this)} close={this.dialogClose.bind(this)}>

              <table>
                  <tbody>
                      <tr>
                          <td>SSID:</td>
                      </tr>
                      <tr>
                          <td><b>AndroidAP</b></td>
                      </tr>
                      <tr>
                          <td>Password:</td>
                      </tr>
                      <tr>
                          <td>
                              <span id='password' ref={this.spanRef} className="e-input-group">
                                  <input type="password" onFocus={this.onFocus.bind(this)} onBlur={this.onBlur.bind(this)} name="Required" className="e-input" />
                              </span></td>
                      </tr>
                  </tbody>
              </table>
          </DialogComponent>
        </div>
    );
  }
}

export default CalendarView;
