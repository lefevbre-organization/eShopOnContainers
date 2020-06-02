import React, { Component } from 'react';
import {
    PAGE_LOGIN,
    PAGE_SELECT_COMPANY,
    PAGE_MESSAGE_CLASSIFICATIONS 
} from '../../constants'
import Login from "../login/login";
import SelectCompany from "../select-company/select-company";

export default class Routing extends Component {
    constructor(props) {
      super(props);
      let token = JSON.parse(localStorage.getItem('auth-lexon'));
      let actualPage = token ? PAGE_SELECT_COMPANY : PAGE_LOGIN;
  
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

        case PAGE_SELECT_COMPANY:
          return (
            <SelectCompany
              changePage={this.changePage}
            />
          );
      
        // case PAGE_MESSAGE_CLASSIFICATIONS:
        //   return (
        //     <MessageClassifications 
        //       user={user} 
        //       bbddAddon={bbdd}
        //       addonData={addonData}
        //       toggleNotification={toggleNotification}
        //     />
        //   );
  
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
  

  

  