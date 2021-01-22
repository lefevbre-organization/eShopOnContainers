import React, { PureComponent , Fragment } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CheckBoxComponent } from '@syncfusion/ej2-react-buttons';
import CalendarMenu from '../calendarmenu/calendarmenu';
import "@reach/menu-button/styles.css";
import "./calendaritem.scss";

export class CalendarItem extends PureComponent {

  constructor(props) {
    super(props);
      this.onClick = this.onClick.bind(this);  
      this.state = {
          css : this.makeid(5)        
      };
    }

  onClick(evt) {  
      this.props.onClick(evt, this.props.id, this.ownerObj.checked );
    }

 makeid(length) {
    var result = '';
    var characters = 'abcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

  render() {
    const {name, messagesUnread} = this.props;
    const iconProps = this.props.iconProps;

    let selected = this.props.selected ? " selected" : "";

   // const messagesUnreadLocale = messagesUnread.toLocaleString();
      return (   
        <Fragment>
          <div>
          <div
            className={`text-left text-dark pl-4 pr-5 py-2 border-0 ${selected}`}
            title={
              name 
            }           
              >
                 
              <CheckBoxComponent cssClass={this.state.css}  ref={checkboxObj => this.ownerObj = checkboxObj}
                value={this.props.id}
                id={this.props.id}
                label={name}                
                change={this.onClick}
                checked={this.props.primary} 
              />
                
              {(this.props.accessRole === 'owner') && 
                      <CalendarMenu
                          key={this.props.id}
                          onClick={this.navigateToList}
                          name={this.props.summary}
                          id={this.props.id}
                          color={this.props.color}
                          onCalendarOpenCalnendarView={this.props.onCalendarOpenCalnendarView}
                          onCalendarDelete={this.props.onCalendarDelete}
                          onCalendarColorModify={this.props.onCalendarColorModify}     
                          isPrimary={this.props.primary}  
                      />   
              }
                             
              </div> 

          </div>

          <style>{`
                 .e-checkbox-wrapper.${this.state.css} .e-frame.e-check,
                    .e-checkbox-wrapper.${this.state.css} .e-checkbox:focus + .e-frame.e-check { /* csslint allow: adjoining-classes */
                      background-color: ${this.props.color} !important;
                    }

                    .e-checkbox-wrapper.${this.state.css}:hover .e-frame.e-check { /* csslint allow: adjoining-classes */
                          background-color: ${this.props.color} !important;
}
                `}</style>
        </Fragment>
    );
  }
}

export default CalendarItem;
