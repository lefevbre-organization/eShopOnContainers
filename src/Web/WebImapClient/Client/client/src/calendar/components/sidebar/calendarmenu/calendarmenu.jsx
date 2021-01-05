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
          'custom1': ['#750c20', '#0e2b21', '#a4864a', '#30197e',
              '#914150', '#435850', '#b69e70', '5c4b98',
              '#ab1279', '#ced038', '#d4bb8a', '13439b',
              '#bc4594', '#d8da62', '#ddc9a2', '466ab0',
              '#e6879e', '#68747c', '#d6b43c', '40b6b5',
              '#eb9fb3', '879096', '#dec365', '68c5c3']
      }; 
     // this.roundedPaletteColors.custom1.push(this.props.color); 
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
