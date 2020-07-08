import React, { Component } from 'react';
import {
    PAGE_LOGIN,
    PAGE_SELECT_COMPANY,
    PAGE_MESSAGE_CLASSIFICATIONS,
    PAGE_DOCUMENT_ATTACHED
} from '../../constants';
import Login from '../login/login';
import SelectCompany from '../select-company/select-company';
import MessageClassifications from '../message-classifications/message-classifications';
import DocumentAttached from '../document-attached/document-attached';

export default class Routing extends Component {
    constructor(props) {
      super(props);
      let token = JSON.parse(localStorage.getItem('auth-lexon'));
      let selectCompany = JSON.parse(localStorage.getItem('selectCompany'));
      let actualPage = null;

      if(selectCompany && selectCompany.conversationId){
        actualPage = PAGE_MESSAGE_CLASSIFICATIONS;
      } else if(selectCompany && !selectCompany.conversationId) {
        actualPage = PAGE_DOCUMENT_ATTACHED;
      } else {
        actualPage = token ? PAGE_SELECT_COMPANY : PAGE_LOGIN;
      }
 
      this.state = {
        actualPage: actualPage,
        data: selectCompany
      };
      this.changePage = this.changePage.bind(this);
    }

    changePage(page, data) {
      this.setState({ 
        actualPage: page, 
        data: data
       });
    }
  
    renderPage() {
      const { actualPage, data } = this.state;
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
      
        case PAGE_MESSAGE_CLASSIFICATIONS:
          return (
            <MessageClassifications 
              isOfficeInitialized={isOfficeInitialized}
              selectCompany={data} 
              changePage={this.changePage}
            />
          );

        case PAGE_DOCUMENT_ATTACHED: 
        return (
          <DocumentAttached 
            isOfficeInitialized={isOfficeInitialized}
            selectCompany={data} 
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
  

  

  