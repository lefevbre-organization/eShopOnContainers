import React, { PureComponent } from 'react';
import './header.css';

export class Header extends PureComponent {
  render() {
    const { userName } = this.props;

    return (
      <header className='d-flex p-3 align-content-center align-items-center header '>
        <div className='header-user'>
          <div>
            <span className='lf-icon-user'></span>
          </div>
          <div>
            <span className='user-name'>{userName}</span>
          </div>
        </div>
        <div className='header-left'></div>
      </header>
    );
  }
}
