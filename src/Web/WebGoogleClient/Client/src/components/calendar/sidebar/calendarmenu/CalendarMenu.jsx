import React, { PureComponent } from "react";
import {
    Menu,
    MenuList,
    MenuButton,
    MenuItem,
    MenuItems,
    MenuPopover,
    MenuLink,
} from "@reach/menu-button";
import "./calendarmenu.scss";
//import { CalendarView } from "..calendarview/CalendarView";
import { ColorPickerComponent } from '@syncfusion/ej2-react-inputs';
//import { CalendarView , buttonClick } from "../calendarview/CalendarView";

export class CalendarMenu extends PureComponent {

  constructor(props) {
    super(props);
      this.onClick = this.onClick.bind(this);
      
      this.roundedPaletteColors = {
          'custom1': ['#ff6900', '#fcb900', '#7bdcb5', '#00d084',
              '#8ed1fc', '#0693e3', '#abb8c3', '#eb144c',
              '#f78da7', '#9900ef']
      };     

    }

    
   
  beforeRoundedTileRender(args) {
        args.element.classList.add('e-rounded-palette');
  }
   
    // function to handle the ColorPicker change event
  change(args) {
        document.getElementById('e-shirt-preview').style.backgroundColor = args.currentValue.hex;
  }
  roundedPaletteChange(args) {
        this.defaultObj.element.nextElementSibling.querySelector('.e-selected').style.boxShadow
            = args.currentValue.hex + ' 0 0 7px';
        document.getElementById('e-shirt-preview').style.backgroundColor = args.currentValue.hex;
  }
    rendereComplete() {

  }

  onClick(evt) { 
      this.props.onClick(evt, this.props.id, this.ownerObj.checked );
    }

    calendarView() {
      
   }

  render() {
    const {name, messagesUnread} = this.props;
    const iconProps = this.props.iconProps;
      let selected = this.props.selected ? " selected" : "";
     
   // const messagesUnreadLocale = messagesUnread.toLocaleString();
      return (
                   <span class="closeb">
                      <Menu>
                          <MenuButton className="menubutton">...</MenuButton>
                          <MenuList className="menupanel">
                      <MenuItem id={this.props.id} className="e-controle-CalendarId e-field e-control e-dropdownlist"  onClick={this.props.onCalendarOpenCalnendarView}>
                              <span >Config and share</span>                          
                              </MenuItem>
                          <MenuItem className="e-controle-CalendarId e-field e-control e-dropdownlist" >                          
                              <span >Remove</span>
                          </MenuItem>
                              <div className='e-rounded-wrap'>
                                  <ColorPickerComponent id='rounded-palette' mode='Palette' ref={(scope) => { this.defaultObj = scope; }} modeSwitcher={false} inline={true} showButtons={false} columns={5} presetColors={this.roundedPaletteColors} beforeTileRender={this.beforeRoundedTileRender.bind(this)} change={this.roundedPaletteChange.bind(this)}></ColorPickerComponent>
                              </div>                    
                          </MenuList>
                      </Menu>
                  </span>
    );
  }
}

export default CalendarMenu;
