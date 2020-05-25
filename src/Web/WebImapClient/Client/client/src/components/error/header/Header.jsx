import React, { PureComponent } from 'react';

export class Header extends PureComponent {
  render() {
    const { userName } = this.props;

    return (
      <>
        <header className='d-flex p-3 align-content-center align-items-center header '>
          <div className='logo-wrapper'>
            <img src='/assets/images/lefevbre-logo.png'></img>
          </div>
        </header>
        <style jsx>{`
          .logo-wrapper {
            height: 33px;
            display: flex;
            width: 100%;
            justify-content: center;
          }

          .header {
            flex: 0;
            border-bottom: 1px solid #d9dfe2;
            background-color: #001978;
            justify-content: flex-end;
            color: #fff;
          }

          .header-user {
            justify-content: right;
            display: flex;
            align-items: center;
          }

          .header-user .lf-icon-user {
            font-size: 24px;
            margin-right: 10px;
          }

          .header-left {
            flex: 0 0 100px;
          }
        `}</style>
      </>
    );
  }
}
export default Header;
