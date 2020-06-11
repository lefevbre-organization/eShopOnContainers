import * as React from "react";
import { CommandBar, IconButton } from "office-ui-fabric-react";
import './header.css';

class Header extends React.Component {
  
  render() {

   const optionIcon = { iconName: 'MoreVertical' };

    const menuProps = {
        items: [
          {
            key: 'logout',
            text: 'Salir',
            onClick: () => this.props.logout(),
            iconProps: { iconName: 'SignOut' },
          }
        ],
        directionalHintFixed: true,
      };
      
    return (
      <section className="header ms-u-fadeIn500">
        {/* <CommandBar
         overflowItems={_overflowItems} */}
          <IconButton
          menuProps={menuProps}
          iconProps={optionIcon}
          title="option"
          ariaLabel="option"
        />
      </section>
    );
  }
}

export default Header