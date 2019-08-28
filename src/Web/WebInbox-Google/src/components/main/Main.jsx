import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { bindActionCreators, compose } from "redux";
import Header from "../header/Header";
import Sidebar from "../sidebar/Sidebar";
import LexonConnector from "../../lex-on_connector/lex-on_connector";
import NotFound from "../not-found/NotFound";
import './main.scss';
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
import { faSpinner, faWindowClose, faClosedCaptioning, faDoorClosed, faTimes, faTimesCircle } from "@fortawesome/free-solid-svg-icons";

import PerfectScrollbar from "react-perfect-scrollbar";
import {
    ReflexContainer,
    ReflexSplitter,
    ReflexElement
} from 'react-reflex'
import 'react-reflex/styles.css'

import { start, registerApplication } from 'single-spa'

import * as singleSpa from 'single-spa';
import { registerLexonApp } from "../../apps/lexonconn-app";

import SidebarCnn from "react-sidebar";
import SidebarComponent from "../../apps/sidebar_content"


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
    
    //registerReactApp();

    //singleSpa.start();

    this.state = {         
       isVisible: true,
       fluid: true,
       customAnimation: false,
       slow: false,
       size: 0.25,       
       sidebarOpen: false,
       sidebarDocked: false,
       sidebarComponent: <SidebarComponent />,
       sideBar: {
          collapsed: false
       }
      };  
      
      this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
      this.onSetSidebarDocked = this.onSetSidebarDocked.bind(this);
     
    }
    onSetSidebarOpenCalendar(open) {
        this.setState({ sidebarComponent: <SidebarComponent /> });
        this.onSetSidebarDocked(true);
    }

    onSetSidebarOpenLexon(open) {
        let lexon = <img border="0" alt="Lefebvre" src="assets/img/lexon-fake.png"></img>;
        this.setState({ sidebarComponent: lexon });
        this.onSetSidebarDocked(true);
    }

    onSetSidebarOpenQMemento(open) {
        let lexon = <img border="0" alt="Lefebvre" src="assets/img/lexon-fake-null.png"></img>;
        this.setState({ sidebarComponent: lexon });
        this.onSetSidebarDocked(true);
    }

    onSetSidebarOpenCompliance(open) {
        let lexon = <img border="0" alt="Lefebvre" src="assets/img/lexon-fake-null.png"></img>;
        this.setState({ sidebarComponent: lexon });
        this.onSetSidebarDocked(true);
    }


    onSetSidebarOpenDatabase(open) {
        let lexon = <img border="0" alt="Lefebvre" src="assets/img/lexon-fake-null.png"></img>;
        this.setState({ sidebarComponent: lexon });
        this.onSetSidebarDocked(true);
    }

    onSetSidebarOpen(open) {
        this.setState({ sidebarOpen: open });
    }

    onSetSidebarDocked(open) {
        this.setState({ sidebarDocked: open });
        this.setState({ sidebarOpen: open });
    }
  
  componentDidMount() {
    /* Label list is fetched from here 
    so that we can declare Routes by labelId 
    before rendering anything else */   
    this.getLabelList();

    window.addEventListener("toggleClock", function (event) {
        alert(event.detail.name);
    });   
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

  registerConnectorApp() {
    let el = document.getElementById('main-lexon-connector')
    if (!el) {
      try {
          // const activityFunction = location => location.pathname.startsWith('/');
          // registerApplication('lex-on-connector', () => import('../../lex-on_connector/index.js'), activityFunction);
          // start();
          
          registerLexonApp();
          singleSpa.start();
      }
      catch (error) {
          console.error(error);
      }
    }               
  }
  
  getLabelList() {
      this.props.getLabels();     
  }

  getLabelMessages({labelIds, q, pageToken}) {
    this.props.emptyLabelMessages();    
    this.props.getLabelMessages({ labelIds, q, pageToken });  
    this.registerConnectorApp();
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

    let imgUrl = 'assets/img/settings-gears.svg'
    if (this.props.labelsResult.labels.length < 1) {
        return this.renderSpinner();       
    }

      return ( 



          <SidebarCnn
              sidebar={this.state.sidebarComponent}
              open={false}
              pullRight={true}
              docked={this.state.sidebarDocked}
              styles={{
                  sidebar: {
                      background: "white",
                      zIndex: 9999,
                      overflowY: "hidden",
                      WebkitTransition: "-webkit-transform 0s",
                      willChange: "transform",
                      overflowY: "hidden"
                  },
                  content: {
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      overflowY: "hidden",
                      overflowX: "hidden",
                      WebkitOverflowScrolling: "touch",
                      transition: "left .0s ease-out, right .0s ease-out",
                  },
                  overlay: {
                      zIndex: 1,
                      position: "fixed",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      opacity: 0,
                      visibility: "hidden",
                      //transition: "opacity .3s ease-out, visibility .0s ease-out",
                      backgroundColor: "rgba(0,0,0,.3)"
                  },
                  dragHandle: {
                      zIndex: 1,
                      position: "fixed",
                      top: 0,
                      bottom: 0
                  }
              }}

          >

              <Fragment>
                  <Header googleUser={this.props.googleUser}
                      onSignout={this.onSignout}
                      setSearchQuery={this.props.setSearchQuery}
                      getLabelMessages={this.getLabelMessages}
                      searchQuery={this.props.searchQuery}
                  />
                  <section className="main hbox space-between">
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
                 
                  

                      <div className="productpanel">
                          <span className="productsbutton">
                              <div onClick={() => this.onSetSidebarOpenLexon(true)}>
                                  <img className="imgproduct" border="0" alt="Lex-On" src="assets/img/icon-lexon.png"></img>
                              </div>
                          </span>
                          <span className="productsbutton">
                              <div onClick={() => this.onSetSidebarOpenQMemento(true)}>
                                  <img className="imgproduct" border="0" alt="Calendar" src="assets/img/icon-qmemento.png"></img>
                              </div>
                          </span>
                          <span className="productsbutton">
                              <div onClick={() => this.onSetSidebarOpenCompliance(true)}>
                                  <img className="imgproduct" border="0" alt="Calendar" src="assets/img/icon-compliance.png"></img>
                              </div>
                          </span>
                          <span className="productsbutton">
                              <div onClick={() => this.onSetSidebarOpenCalendar(true)}>
                                  <img className="imgproduct" border="0" alt="Calendar" src="assets/img/icon-calendar.png"></img>
                              </div>
                          </span>
                          <span className="productsbutton">
                              <button onClick={() => this.onSetSidebarDocked(false)}  className="btn compose-btn">
                                  <img className="" border="0" alt="Calendar" src="assets/img/icon-close-empty.png"></img>
                              </button>                             
                          </span>
                          <span className="spaceproduct">
                          </span>
                      </div>
                  </section>
              </Fragment>  

          </SidebarCnn>

           
      );
      
  }

    render()
    { 
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
