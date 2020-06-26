import * as React from "react";
import { CommandBar, IconButton } from "office-ui-fabric-react";
import './header.css';

class Header extends React.Component {
  
  render() {
   const { user } = this.props;
   console.log(user);
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
        <div className="header-divider"></div>
        <div className="header-panel"></div>
        <div className="header-divider-email"> 
         <span className="title-user-email">{user ? user.login : ''}</span>
        </div>
        <div className="header-divider-name">
         <span className="title-user-name">{user ? user.name : ''}</span>
         </div>
        <div className="icon-menu">
         <IconButton
          menuProps={menuProps}
          iconProps={optionIcon}
          title="option"
          ariaLabel="option"
        />
        </div>
       

       
        
      
      </section>
    );
  }
}

export default Header