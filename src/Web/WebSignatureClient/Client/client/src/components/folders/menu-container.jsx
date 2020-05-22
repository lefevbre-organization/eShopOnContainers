import React from 'react';
import FolderList from './menu-list';
import mainCss from '../../styles/main.scss';

export const MenuContainer = () => {
  return (
    <nav className={`${mainCss['mdc-list']}`}>
      <FolderList/>
    </nav>
  );
};

export default (MenuContainer);