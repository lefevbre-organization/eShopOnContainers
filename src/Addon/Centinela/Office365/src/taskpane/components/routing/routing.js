import React, { Component } from 'react';
import {
    PAGE_LOGIN,
    PAGE_ARCHIVE_MESSAGE
} from '../../constants';
import Login from '../login/login';
import ArchiveMessage from '../archive-message/archive-message';


export default class Routing extends Component {
    constructor(props) {
      super(props);

      let token = JSON.parse(localStorage.getItem('auth-centinela'));

      let actualPage = token ? PAGE_ARCHIVE_MESSAGE : PAGE_LOGIN;

      this.state = {
        actualPage: actualPage
      };
      this.changePage = this.changePage.bind(this);
    }

    changePage(page) {
      this.setState({ actualPage: page });
    }
  
    renderPage() {
      const { actualPage } = this.state;
      const { title, isOfficeInitialized } = this.props;

      switch (actualPage) {

        case PAGE_LOGIN:
          return (
            <Login 
             title={title}
             isOfficeInitialized={isOfficeInitialized}
             changePage={this.changePage}
            />
         );

        case PAGE_ARCHIVE_MESSAGE:
          return (
            <ArchiveMessage 
            title={title}
            isOfficeInitialized={isOfficeInitialized}
            changePage={this.changePage}
           />
          )

        default:
          return <Login changePage={this.changePage} />;
      }
    }
  
    render() {
      return (
        <React.Fragment>
          {this.renderPage()}
        </React.Fragment>
      );
    }
  }
  

  

  