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
import { ColorPickerComponent } from '@syncfusion/ej2-react-inputs';
import i18n from 'i18next';
import "./calendarmenu.scss";


export class CalendarMenu extends PureComponent {

  constructor(props) {
    super(props);        
      this.roundedPaletteColors = {
          'custom1': [ '#fcb900', '#7bdcb5', '#00d084',
              '#8ed1fc', '#0693e3', '#abb8c3', '#eb144c',
              '#f78da7', '#9900ef']
      }; 
      this.roundedPaletteColors.custom1.push(this.props.color); 
    }    
   
  beforeRoundedTileRender(args) {
        args.element.classList.add('e-rounded-palette');
  }
  
  roundedPaletteChange(args) {     
      //var color = this.colorObj.value.substr(0, 7);
        this.props.onCalendarColorModify(this.props.id, args.currentValue.hex)
    }

  render() {
    const {name, messagesUnread} = this.props;
    const iconProps = this.props.iconProps;
    let selected = this.props.selected ? " selected" : ""; 
      return (
        <span className="closeb">
           <Menu>
              <MenuButton className="menubutton">...</MenuButton>
              <MenuList className="menupanel">
                 <MenuItem id={this.props.id} className="e-controle-CalendarId e-field e-control e-dropdownlist"  onClick={this.props.onCalendarOpenCalnendarView}>
                    <span >{i18n.t("calendar-sidebar.configandshare")}</span>                          
                 </MenuItem>
                 <MenuItem id={this.props.id} className="e-controle-CalendarId e-field e-control e-dropdownlist" onClick={this.props.onCalendarDelete}>                          
                    <span >{i18n.t("calendar-sidebar.remove")}</span>
                 </MenuItem>
                 <div className='e-rounded-wrap'>
                    <ColorPickerComponent value={this.props.color} id='rounded-palette' mode='Palette' ref={(scope) => { this.colorObj = scope; }} modeSwitcher={false} inline={true} showButtons={false} columns={5} presetColors={this.roundedPaletteColors} beforeTileRender={this.beforeRoundedTileRender.bind(this)} change={this.roundedPaletteChange.bind(this)}></ColorPickerComponent>
                 </div>                    
              </MenuList>
           </Menu>
        </span>
      );
  }
}

export default CalendarMenu;
