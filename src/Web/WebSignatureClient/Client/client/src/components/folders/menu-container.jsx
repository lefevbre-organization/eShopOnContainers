import React from 'react';
import FolderList from './menu-list';
import mainCss from '../../styles/main.scss';

export const MenuContainer = (props) => {
  const { collapsed } = props;
  return (
    <nav className={`${mainCss['mdc-list']}`}>
      <FolderList collapsed={collapsed} />
    </nav>
  );
};

export default (MenuContainer);