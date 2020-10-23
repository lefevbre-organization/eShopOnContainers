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
          'custom1': ['#0078d4', '#498205', '#da3b01', '#69797e',
               '#18a7b5', '#e3008c', '#b5651d',
              '#c50f1f']
      }; 
     // this.roundedPaletteColors.custom1.push(this.props.color); 
    }  


    //const CalendarColors = [
    //    { value: 'LightBlue', color: '#0078d4' },
    //    { value: 'LightGreen', color: '#498205' },
    //    { value: 'LightOrange', color: '#da3b01' },
    //    { value: 'LightGray', color: '#69797e' },
    //    { value: 'LightYellow', color: '#ffff00' },
    //    { value: 'LightTeal', color: '#18a7b5' },
    //    { value: 'LightPink', color: '#e3008c' },
    //    { value: 'LightBrown', color: '#b5651d' },
    //    { value: 'LightRed', color: '#c50f1f' }
    //];
   
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
                      <MenuItem id={this.props.id}
                          className={`e-controle-CalendarId e-field e-control e-dropdownlist   ${this.props.isPrimary ? "hidden" : ""}`}
                          onClick = { this.props.onCalendarDelete }> 

                    <span >{i18n.t("calendar-sidebar.remove")}</span>
                 </MenuItem>
                 <div className='e-rounded-wrap'>
                    <ColorPickerComponent value={this.props.color} id='rounded-palette' mode='Palette' ref={(scope) => { this.colorObj = scope; }} modeSwitcher={false} inline={true} showButtons={false} columns={4} presetColors={this.roundedPaletteColors} beforeTileRender={this.beforeRoundedTileRender.bind(this)} change={this.roundedPaletteChange.bind(this)}></ColorPickerComponent>
                 </div>                    
              </MenuList>
           </Menu>
        </span>
      );
  }
}

export default CalendarMenu;
