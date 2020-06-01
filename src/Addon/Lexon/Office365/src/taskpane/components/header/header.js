import * as React from "react";
import { CommandBar, IconButton } from "office-ui-fabric-react";
import './header.css';

class Header extends React.Component {
  
  render() {

   const emojiIcon = { iconName: 'MoreVertical' };

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
      
    // const _overflowItems = [
    //     {
    //       key: "move",
    //       text: "Move to...",
    //       onClick: () => console.log("Move to"),
    //       iconProps: { iconName: "MoveToFolder" }
    //     },
    //     {
    //       key: "copy",
    //       text: "Copy to...",
    //       onClick: () => console.log("Copy to"),
    //       iconProps: { iconName: "Copy" }
    //     },
    //     {
    //       key: "rename",
    //       text: "Rename...",
    //       onClick: () => console.log("Rename"),
    //       iconProps: { iconName: "Edit" }
    //     },
    //   ];
    
      
    return (
      <section className="header ms-u-fadeIn500">
        {/* <CommandBar
         overflowItems={_overflowItems} */}
          <IconButton
          menuProps={menuProps}
          iconProps={emojiIcon}
          title="Emoji"
          ariaLabel="Emoji"
        />
      </section>
    );
  }
}

export default Header