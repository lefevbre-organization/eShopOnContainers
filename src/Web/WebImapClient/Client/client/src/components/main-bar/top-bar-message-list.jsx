import React, {Fragment} from 'react';
import {translate} from 'react-i18next';
import ButtonModules from './button-modules';
import ButtonUser from './button-user';
import mainCss from '../../styles/main.scss';
import styles from './top-bar-message-list.scss';
import {Link} from "react-router-dom";

const picUrl = 'assets/images/LogoLefebvre.png';
//const picImap = 'assets/images/imap.png';
export const TopBarMessageList = (
  {
    t, collapsed, sideBarToggle, title,
    selectedMessages, onDeleteClick,
    selectedMessagesAllUnread, onMarkReadClick, onMarkUnreadClick
  }) => (
  <div className={mainCss['mdc-top-app-bar__row']}>      
   
    <section className={`${mainCss['mdc-top-app-bar__section']} ${mainCss['mdc-top-app-bar__section--align-start']}  ${styles['modules-item-custom']}`}>  
         <div>
             <Link to="/"><img className={`${styles['main-header-img']}`} border="0" alt="Lefebvre" src={picUrl}></img></Link>
         </div>

        {/* <div className={`${styles['main-header-imap-div']}`}>
             <img border="0" alt="Lefebvre" src={picImap}></img>
         </div>*/}
    </section>
   
    <section className={`${mainCss['mdc-top-app-bar__section']} ${mainCss['mdc-top-app-bar__section--align-end']}  ${styles['modules-item-custom']}`}>
                <ButtonUser className={`${styles['modules-item-custom']}`} />
                <div className={`${styles['modules-item-custom-space']}`}></div>
                <ButtonModules className={`${styles['modules-item-custom']}`} />
    </section>
           
  </div>
);


export default translate()(TopBarMessageList);
