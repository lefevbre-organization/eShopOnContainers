import React, { Component } from 'react';
import {
    PAGE_LOGIN,
    PAGE_ARCHIVE_MESSAGE,
    PAGE_ARCHIVE_ATTACHMENT
} from '../../constants';
import Login from '../login/login';
import ArchiveMessage from '../archive-message/archive-message';
import ArchiveAttachment from '../archive-attachment/archive-attachment';


export default class Routing extends Component {
    constructor(props) {
      super(props);

      let actualPage = PAGE_LOGIN;

      this.state = {
        actualPage: actualPage
      };
      this.changePage = this.changePage.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
      if(prevProps.isOfficeInitialized !== this.props.isOfficeInitialized) {
        const conversationId = Office.context.mailbox.initialData.conversationId;
        let token = JSON.parse(localStorage.getItem('auth-centinela'));
        if(token && conversationId) {
          this.changePage(PAGE_ARCHIVE_MESSAGE);
        } else if (token && !conversationId) {
          this.changePage(PAGE_ARCHIVE_ATTACHMENT);
        }
      }
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
          );

        case PAGE_ARCHIVE_ATTACHMENT: 
         return (
          <ArchiveAttachment 
           isOfficeInitialized={isOfficeInitialized}
           changePage={this.changePage}
          />
        ); 

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
  

  

  