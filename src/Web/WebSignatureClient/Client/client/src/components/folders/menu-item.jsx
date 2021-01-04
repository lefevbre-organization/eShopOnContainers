import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import i18n from 'i18next';
import styles from './menu-list.scss';
// import {FolderTypes} from '../../services/folder';
// import styles from './menu-item.scss';
// import mainCss from '../../styles/main.scss';

const MenuItem = props => {

  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    if(props.id === props.selectedService) {
      setOpen(true);
    }
  }, [props.selectedService]);

 const content = () => {
    const { collapsed, onClick, id } = props;
    const option1 = 'En progreso';
    const option2 = 'Completadas';
    const option3 = 'Mostrar todas';
    const option4 = 'Canceladas';
    return (
      <ul className={`${styles['nav-firmas']}`}>
        <li className={`${styles.todas}`}>
          <a href="#" id={option3} onClick={event => onClick(event, option3)}>
            <span className="lf-icon-folder"> 
            </span> 
            { 
             collapsed ?  ''  : 
             <span>{i18n.t('sideBar.filterAll')}</span>
             } 
          </a>
        </li>  
        {id != 'certifiedDocument' ? 
        <li className={`${styles['en-progreso']}`}>
          <a href="#" id={option1} onClick={event => onClick(event, option1)}>
            <span className="lf-icon-folder">
            </span>
            { 
             collapsed ?  ''  : 
             <span>{i18n.t('sideBar.filterInProgress')}</span>
            } 
          </a>
        </li> : null}
        {id != 'certifiedDocument' ?
        <li className={`${styles.completadas}`}>
          <a href="#" id={option2} onClick={event => onClick(event, option2)}>
            <span className="lf-icon-folder">
            </span>
            { 
             collapsed ?  ''  : 
             <span>{i18n.t('sideBar.filterCompleted')}</span>
            } 
          </a>
        </li> : null}
        {(id == 'signature' && id != 'certifiedDocument') ? 
        <li className={`${styles.canceladas}`}>
          <a href="#" id={option4} onClick={event => onClick(event, option4)}>
            <span className="lf-icon-folder">
            </span>
            { 
             collapsed ?  ''  : 
             <span>{i18n.t('sideBar.filterCancelled')}</span>
            } 
          </a>
        </li> : null}
        {(id == 'certifiedSms' && id != 'certifiedSms') ? 
        <li className={`${styles.canceladas}`}>
          <a href="#" id={option4} onClick={event => onClick(event, option4)}>
            <span className="lf-icon-unsolved">
            </span>
            { 
             collapsed ?  ''  : 
             <span>{i18n.t('signaturesGrid.statusError')}</span>
            } 
          </a>
        </li> : null}
      </ul>
 
    ); 
  }

  return (
  <>
      { 
        props.disable ? 
        <>
           { 
         props.collapsed ?  
            <div className={`${styles['title-nav-firmas']}`}
            onClick={() => setOpen(!isOpen)}>
             <span className={props.icon}>
             </span>
            </div> :  
            <div 
            className={`${styles['title-nav-firmas']}`}
            onClick={() => setOpen(!isOpen)} >
             <span className={props.icon}>
             </span>{props.title}
             {!isOpen ? <span className={`lf-icon-angle-down ${styles['icon-angle']}`}></span> : <span className={`lf-icon-angle-up ${styles['icon-angle']}`}></span>}
             
             
            </div>
           }  
            <div className={`${styles['collapsed-item']} ${!isOpen ? styles['collapsed'] : ''}`}>
              <div>
                {content()}
              </div>
            </div>
        </> : 
          props.collapsed ?  
           <div 
            className={`${styles['title-nav-firmas']} ${styles['title-nav-disble']}`}
            onClick={props.getConfirm} >
            <span className={props.icon}>
            </span>
           </div> :  
           <div 
            className={`${styles['title-nav-firmas']} ${styles['title-nav-disble']}`}
            onClick={props.getConfirm} >
            <span className={props.icon}>
            </span>{props.title}
           </div> 
      }
  </>
)};

export default MenuItem;

{/* // MenuItem.propTypes = {
//   className: PropTypes.string,
//   graphic: PropTypes.string,
//   label: PropTypes.string.isRequired,
//   selected: PropTypes.bool.isRequired,
//   onClick: PropTypes.func
// }; */}

{/* // MenuItem.defaultProps = {
//   className: '',
//   graphic: FolderTypes.FOLDER.icon,
//   selected: false
  
// }; */}


