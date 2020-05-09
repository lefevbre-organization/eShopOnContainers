import React, { PureComponent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CheckBoxComponent } from '@syncfusion/ej2-react-buttons';
import CalendarMenu from '../calendarmenu/CalendarMenu';
import "@reach/menu-button/styles.css";
import "./calendaritem.scss";

export class CalendarItem extends PureComponent {

  constructor(props) {
    super(props);
      this.onClick = this.onClick.bind(this);

     

    }

  

  onClick(evt) {       
     
      this.props.onClick(evt, this.props.id, this.ownerObj.checked );
  }

  render() {
    const {name, messagesUnread} = this.props;
    const iconProps = this.props.iconProps;

      let selected = this.props.selected ? " selected" : "";
     
   // const messagesUnreadLocale = messagesUnread.toLocaleString();
      return (        
          <div>
          <li
            className={`text-truncate text-left text-dark pl-4 pr-5 py-2 border-0 ${selected}`}
            title={
              name 
            }           
          >
              <CheckBoxComponent  ref={checkboxObj => this.ownerObj = checkboxObj}
                value={this.props.id}
                id={this.props.id}
                label={name}                
                change={this.onClick}
                checked={this.props.primary}                
              >
              </CheckBoxComponent>
              {(this.props.accessRole === 'owner') && 
                      <CalendarMenu
                          key={this.props.id}
                          onClick={this.navigateToList}
                          name={this.props.summary}
                          id={this.props.id}
                          onCalendarOpenCalnendarView={this.props.onCalendarOpenCalnendarView}
                      />   
              }
                             
          </li>              
       </div>
    );
  }
}

export default CalendarItem;
