import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { bindActionCreators, compose } from "redux";
import Dock from "react-dock";
import SplitPane from "react-split-pane";
import Header from "../header/Header";
import Sidebar from "../sidebar/Sidebar";
import NotFound from "../not-found/NotFound";
import './main.scss';
import styled from "styled-components";

import MessageList from "../content/message-list/MessageList";
import MessageContent from "../content/message-list/message-content/MessageContent";

import { Route, Switch, withRouter } from "react-router-dom";

import { getLabels } from "../sidebar/sidebar.actions";

import {
  getLabelMessages,
  emptyLabelMessages,
  toggleSelected,
  setPageTokens,
  addInitialPageToken,
  clearPageTokens,
  setSearchQuery
} from "../content/message-list/actions/message-list.actions";

import {selectLabel} from '../sidebar/sidebar.actions';
import {signOut} from '../../api/authentication';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faWindowClose, faClosedCaptioning, faDoorClosed, faTimes } from "@fortawesome/free-solid-svg-icons";


const Wrapper = styled.div`
  .Resizer {
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    background: #000;
    opacity: 0.2;
    z-index: 1;
    -moz-background-clip: padding;
    -webkit-background-clip: padding;
    background-clip: padding-box;
  }

  .Resizer:hover {
    -webkit-transition: all 2s ease;
    transition: all 2s ease;
  }

  .Resizer.horizontal {
    height: 11px;
    margin: -5px 0;
    border-top: 5px solid rgba(255, 255, 255, 0);
    border-bottom: 5px solid rgba(255, 255, 255, 0);
    cursor: row-resize;
    width: 100%;
  }

  .Resizer.horizontal:hover {
    border-top: 5px solid rgba(0, 0, 0, 0.5);
    border-bottom: 5px solid rgba(0, 0, 0, 0.5);
  }

  .Resizer.vertical {
    width: 11px;
    margin: 0 -5px;
    border-left: 5px solid rgba(255, 255, 255, 0);
    border-right: 5px solid rgba(255, 255, 255, 0);
    cursor: col-resize;
  }

  .Resizer.vertical:hover {
    border-left: 5px solid rgba(0, 0, 0, 0.5);
    border-right: 5px solid rgba(0, 0, 0, 0.5);
  }
  .Pane1 {
    // background-color: blue;
    display: flex;
    min-height: 0;
  }
  .Pane2 {
    // background-color: red;
    display: flex;
    min-height: 0;
  }
`;

const positions = ['left', 'top', 'right', 'bottom'];
const dimModes = ['transparent', 'none', 'opaque'];

const styles = {
    root: {
        fontSize: '16px',
        color: '#999',
        height: '100vh'
    },
    main: {
        width: '100%',
        height: '150%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '30vh'
    },
    dockContent: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
    },
    remove: {
        position: 'absolute',
        zIndex: 1,
        right: '10px',
        top: '10px',
        cursor: 'pointer'
    }
}


export class Main extends Component {
  constructor(props) {
    super(props);

    this.getLabelList = this.getLabelList.bind(this);
    this.getLabelMessages = this.getLabelMessages.bind(this);
    this.renderLabelRoutes = this.renderLabelRoutes.bind(this);
    this.loadLabelMessages = this.loadLabelMessages.bind(this);
    this.navigateToNextPage = this.navigateToNextPage.bind(this);
    this.navigateToPrevPage = this.navigateToPrevPage.bind(this);
    this.addInitialPageToken = this.addInitialPageToken.bind(this);
    this.onSignout = this.onSignout.bind(this);

    this.state = {         
       isVisible: true,
       fluid: true,
       customAnimation: false,
       slow: false,
       size: 0.25
     };

  }
  
  componentDidMount() {
    /* Label list is fetched from here 
    so that we can declare Routes by labelId 
    before rendering anything else */
    this.getLabelList();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.signedInUser !== this.props.signedInUser) {
      this.setState({
        signedInUser: this.props.signedInUser
      });
    }

    const {labels} = this.props.labelsResult;
    const {pathname} = this.props.location;
    const selectedLabel = labels.find(el => el.selected);
    const labelPathMatch = labels.find(el => el.id.toLowerCase() === pathname.slice(1));
    if (!selectedLabel) {
      if (labelPathMatch && this.props.searchQuery === "") {
        this.props.selectLabel(labelPathMatch.id);
      }      
    }
    else {
      if (labelPathMatch && selectedLabel.id !== labelPathMatch.id) {
        this.props.selectLabel(labelPathMatch.id);
      } 
    }
  }

  navigateToNextPage(token) {
    const searchParam = this.props.location.search;
    const currentToken = searchParam.indexOf("?") === 0 ? searchParam.slice(1) : "";
    this.props.setPageTokens({
      prevPageToken: currentToken
    });
    this.props.history.push(token);
  }

  navigateToPrevPage(token) {
    this.props.history.push(token);
  }

  loadLabelMessages(label) {
    const currentSearchQuery = this.props.searchQuery;
    this.props.clearPageTokens();
    this.props.selectLabel(label.id);    

    const newPathToPush = `/${label.id.toLowerCase()}`;

    if (currentSearchQuery && currentSearchQuery !== "") {
      this.props.setSearchQuery("");
      const {pathname} = this.props.location;
      if (newPathToPush === pathname) {
        this.getLabelMessages({labelIds: [label.id] });
        return;
      }
    }

    this.props.history.push(`/${label.id.toLowerCase()}`);
  }
  

  getLabelList() {
    this.props.getLabels();
  }

  getLabelMessages({labelIds, q, pageToken}) {
    this.props.emptyLabelMessages();    
    this.props.getLabelMessages({labelIds, q, pageToken});
  }


  addInitialPageToken(token) {
    this.props.addInitialPageToken(token);
  }

  renderLabelRoutes() {
    return this.props.labelsResult.labels.map(el => (
      <Route
        key={el.id + '_route'}
        exact
        path={"/" + el.id}
        render={props => {          
          const that = this;
          return (
            <MessageList
              {...props}
              getLabelMessages={this.getLabelMessages}
              messagesResult={this.props.messagesResult}
              toggleSelected={this.props.toggleSelected}
              navigateToNextPage={this.navigateToNextPage}
              navigateToPrevPage={this.navigateToPrevPage}
              pageTokens={this.props.pageTokens}
              addInitialPageToken={this.addInitialPageToken}
              parentLabel={that.props.labelsResult.labels.find(el => el.id === props.match.path.slice(1) )}
              searchQuery={this.props.searchQuery}
            />
          )
        }}
      />
    ));    
  }

  renderSpinner() {
    return (
      <div className="d-flex h-100 align-items-center justify-content-center">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
      </div>
    )
  }

  onSignout() {
    const that = this;
    signOut().then(_ => {
      that.props.history.replace('inbox');
      window.location.reload(true);
    })
  }

  renderInboxViewport() {
     
    if (this.props.labelsResult.labels.length < 1) {
      return this.renderSpinner();
    }

      return (

      <Fragment>
        <Header googleUser={this.props.googleUser} 
          onSignout={this.onSignout} 
          setSearchQuery={this.props.setSearchQuery}
          getLabelMessages={this.getLabelMessages} 
          searchQuery={this.props.searchQuery}
        />

        <section className="main hbox space-between">
          <Wrapper>
             <SplitPane split="vertical" minSize={125} maxSize={450} defaultSize="16%">
                          <Sidebar
                              getLabelList={this.getLabelList}
                              pathname={this.props.location.pathname}
                              labelsResult={this.props.labelsResult}
                              onLabelClick={this.loadLabelMessages}
                          />
                          <article className="d-flex flex-column position-relative">
                              <Switch>
                                  {this.renderLabelRoutes()}
                                  <Route
                                      exact
                                      path="/notfound"
                                      component={NotFound}
                                  />
                                  <Route
                                      exact
                                      path="/:id([a-zA-Z0-9]+)"
                                      component={MessageContent}
                                  />
                              </Switch>
                          </article>
                         
             </SplitPane>
            

          </Wrapper>
          
         
         </section>
             
         <Dock position='right' dimMode="none" isVisible={this.state.isVisible}>
             {/* you can pass a function as a child here */}
             <div className="CloseButton"  onClick={() => this.setState({ isVisible: !this.state.isVisible })}>
                 <FontAwesomeIcon icon={faTimes} />
             </div>
             <div className="Center">
                    TODO ACTION PANEL
             </div>
         </Dock>

        </Fragment>
      
    );
  }

    render() {     
    
    return this.renderInboxViewport();
  }

   

}

const mapStateToProps = state => ({
  labelsResult: state.labelsResult,
  messagesResult: state.messagesResult,
  pageTokens: state.pageTokens,
  searchQuery: state.searchQuery
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      getLabels,
      getLabelMessages,
      emptyLabelMessages,
      toggleSelected,
      selectLabel,
      setPageTokens,
      addInitialPageToken,
      clearPageTokens,
      setSearchQuery
    },
    dispatch
  );

export default compose(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(Main);
