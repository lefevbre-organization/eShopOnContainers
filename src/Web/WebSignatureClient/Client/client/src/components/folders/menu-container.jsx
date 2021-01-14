import React from 'react';
import FolderList from './menu-list';
let clickEle;
export const MenuContainer = (props) => {
  const { collapsed } = props;
  return (
    <FolderList collapsed={collapsed}  data={clickEle}/>  
  );
};

export default (MenuContainer);