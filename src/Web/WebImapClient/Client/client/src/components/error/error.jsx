import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import Footer from './footer/Footer';
import Header from './header/Header';
import { ErrorInfo } from './errorInfo/errorInfo';
import { stat } from 'fs';

class ErrorScreen extends React.Component {
  constructor(props) {
    super(props);
    const idCode = props.match.params.id;
    let code = '';

    switch (idCode) {
      case '404':
      case '403':
        code = idCode;
        break;
      default:
        code = '500';
        break;
    }

    this.state = {
      code,
    };
  }

  render() {
    const { code = '500' } = this.state;
    const { token, userId } = this.props;
    return (
      <>
        <div className='error-wrapper'>
          <Header></Header>
          <div className='error-container'>
            <ErrorInfo
              code={this.state.code}
              token={token}
              userId={userId}></ErrorInfo>
          </div>
          <Footer></Footer>
        </div>
        <style jsx>{`
          .error-wrapper {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 100%;
            position: absolute;
            width: 100%;
          }

          .error-container {
            flex: 1;
            background-image: url('/assets/images/background.png');
          }
        `}</style>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  token: state.lexon.token,
  userId: state.lexon.userId,
  login: state.login,
});

export default connect(mapStateToProps)(ErrorScreen);
