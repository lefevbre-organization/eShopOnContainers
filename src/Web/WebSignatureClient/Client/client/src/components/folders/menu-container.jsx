import React from 'react';
import FolderList from './menu-list';
import mainCss from '../../styles/main.scss';
let clickEle;
export const MenuContainer = (props) => {
  const { collapsed } = props;
  return (
    <nav className={`${mainCss['mdc-list']}`}>
      <FolderList collapsed={collapsed}  data={clickEle}/>
    </nav>
  );
};

export default (MenuContainer);