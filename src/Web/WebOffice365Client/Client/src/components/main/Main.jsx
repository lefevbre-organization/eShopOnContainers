import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { bindActionCreators, compose } from "redux";
import Header from "../header/Header";
import Sidebar from "../sidebar/Sidebar";
import NotFound from "../not-found/NotFound";
import "./main.scss";
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
import { selectLabel } from "../sidebar/sidebar.actions";
import { signOut } from "../../api_graph/authentication";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import e from "../../event-bus";
import SidebarCnn from "react-sidebar";
import LexonComponent from "../../apps/lexon_content";
import SidebarComponent from "../../apps/sidebar_content";
import ComposeMessage from "../compose-message/ComposeMessage-fixed";
import "react-reflex/styles.css";
import { config, PROVIDER } from "../../constants";

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
      size: 0.25,
      sidebarOpen: false,
      sidebarDocked: false,
      sidebarComponent: (
        <img border="0" alt="Lefebvre" src="assets/img/lexon-fake.png"></img>
      ),
      leftSideBar: {
        collapsed: false
      },
      loadFolders: false
    };

    e.on("message", function(data) {
      alert("got " + data.text);
      e.emit("received", { text: "Woohoo! Hello from Multi-channel app!" });
    });

    this.onSetSidebarDocked = this.onSetSidebarDocked.bind(this);
    this.onSetSidebarOpenCalendar = this.onSetSidebarOpenCalendar.bind(this);
    this.onSetSidebarOpenLexon = this.onSetSidebarOpenLexon.bind(this);
    this.onSetSidebarOpenQMemento = this.onSetSidebarOpenQMemento.bind(this);
    this.onSetSidebarOpenCompliance = this.onSetSidebarOpenCompliance.bind(
      this
    );
    this.onSetSidebarOpenDatabase = this.onSetSidebarOpenDatabase.bind(this);
    this.handleGetUserFromLexonConnector = this.handleGetUserFromLexonConnector.bind(
      this
    );

    this.toggleSideBar = this.toggleSideBar.bind(this);
  }

  toggleSideBar() {
    const toggleCollapsed = !this.state.leftSideBar.collapsed;
    this.setState({
      leftSideBar: {
        collapsed: toggleCollapsed
      }
    });
  }

  sendMessagePutUser(user) {
    const { selectedMessages } = this.props;
    const listMessages = selectedMessages.map(
      selectedMessage => selectedMessage.id
    );

    window.dispatchEvent(
      new CustomEvent("PutUserFromLexonConnector", {
        detail: {
          user,
          selectedMessageId: listMessages
        }
      })
    );
  }

  handleGetUserFromLexonConnector() {
    const { userId } = this.props.lexon;

    // Comentar esto (es para pruebas)
    // const userId = 120;
    // Comentar esto (es para pruebas)

    if (userId) {
      this.sendMessagePutUser(userId);
    }
  }

  onSetSidebarOpenLexon(open) {
    this.setState({
      sidebarComponent: (
        <LexonComponent sidebarDocked={this.onSetSidebarDocked} />
      )
    });
    this.setState({ sidebarDocked: open });
  }

  onSetSidebarOpenCalendar(open) {
    this.setState({
      sidebarComponent: (
        <SidebarComponent sidebarDocked={this.onSetSidebarDocked} />
      )
    });
    this.setState({ sidebarDocked: open });
  }

  onSetSidebarOpenQMemento(open) {
    let lexon = (
      <img border="0" alt="Lefebvre" src="assets/img/lexon-fake-null.png"></img>
    );
    this.setState({ sidebarComponent: lexon });
    this.setState({ sidebarDocked: open });
  }

  onSetSidebarOpenCompliance(open) {
    let lexon = (
      <img border="0" alt="Lefebvre" src="assets/img/lexon-fake-null.png"></img>
    );
    this.setState({ sidebarComponent: lexon });
    this.setState({ sidebarDocked: open });
  }

  onSetSidebarOpenDatabase(open) {
    let lexon = (
      <img border="0" alt="Lefebvre" src="assets/img/lexon-fake-null.png"></img>
    );
    this.setState({ sidebarComponent: lexon });
    this.setState({ sidebarDocked: open });
  }

  onSetSidebarDocked(open) {
    this.setState({ sidebarDocked: open });
  }

  componentDidMount() {
    /* Label list is fetched from here 
    so that we can declare Routes by labelId 
    before rendering anything else */
    this.getLabelList();

    window.addEventListener(
      "GetUserFromLexonConnector",
      this.handleGetUserFromLexonConnector
    );

    const { userId } = this.props.lexon;
    const { email } = this.props.User;
    if (userId !== null && email !== null) {
      const url = `${config.url.URL_UPDATE_DEFAULTACCOUNT}/${userId}/${PROVIDER}/${email}`;
      fetch(url, {
        method: "GET"
      }).catch(error => {
        console.error("error ->", error);
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener(
      "GetUserFromLexonConnector",
      this.handleGetUserFromLexonConnector
    );
  }

  componentDidUpdate(prevProps, prevState) {
    //if (prevProps.signedInUser !== this.props.signedInUser) {
    //  this.setState({
    //    signedInUser: this.props.signedInUser
    //  });
    //}

    if (prevProps.User !== this.props.User) {
      this.setState({
        signedInUser: this.props.User
      });
    }

    const { labels } = this.props.labelsResult;
    const { pathname } = this.props.location;
    const selectedLabel = labels.find(el => el.selected);
    const labelPathMatch = labels.find(
      el => el.id.toLowerCase() === pathname.slice(1)
    );
    if (!selectedLabel) {
      if (labelPathMatch && this.props.searchQuery === "") {
        this.props.selectLabel(labelPathMatch.id);
      }
    } else {
      if (labelPathMatch && selectedLabel.id !== labelPathMatch.id) {
        this.props.selectLabel(labelPathMatch.id);
      }
    }

    if (
      !this.state.loadFolders &&
      prevProps.labelsResult.labels !== this.props.labelsResult.labels
    ) {
      this.setState({ loadFolders: true });
      if (
        this.props.labelsResult &&
        this.props.labelsResult.labels.length > 0
      ) {
        this.props.history.push(`/${this.props.labelsResult.labels[0].id}`);
      }
    }
  }

  navigateToNextPage(token) {
    const searchParam = this.props.location.search;
    const currentToken =
      searchParam.indexOf("?") === 0 ? searchParam.slice(1) : "";
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
      const { pathname } = this.props.location;
      if (newPathToPush === pathname) {
        this.getLabelMessages({ labelIds: [label.id] });
        return;
      }
    }

    this.props.history.push(`/${label.id.toLowerCase()}`);
  }

  getLabelList() {
    this.props.getLabels();
  }

  getLabelMessages(labelIds, q, pageToken) {
    this.props.emptyLabelMessages();
    this.props.getLabelMessages(labelIds, q, pageToken);
  }

  addInitialPageToken(token) {
    this.props.addInitialPageToken(token);
  }

  renderLabelRoutes() {
    const { leftSideBar } = this.state;
    return this.props.labelsResult.labels.map(el => (
      <Route
        key={el.id + "_route"}
        exact
        path={"/" + el.id}
        render={props => {
          const that = this;
          return (
            <MessageList
              {...props}
              sideBarCollapsed={leftSideBar.collapsed}
              sideBarToggle={this.toggleSideBar}
              getLabelMessages={this.getLabelMessages}
              messagesResult={this.props.messagesResult}
              toggleSelected={this.props.toggleSelected}
              navigateToNextPage={this.navigateToNextPage}
              navigateToPrevPage={this.navigateToPrevPage}
              pageTokens={this.props.pageTokens}
              addInitialPageToken={this.addInitialPageToken}
              parentLabel={that.props.labelsResult.labels.find(
                el => el.id === props.match.path.slice(1)
              )}
              searchQuery={this.props.searchQuery}
            />
          );
        }}
      />
    ));
  }

  renderSpinner() {
    return (
      <div className="d-flex h-100 align-items-center justify-content-center">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
      </div>
    );
  }

  onSignout() {
    const { userId } = this.props.lexon;
    if (userId !== null) {
      const url = `${config.url.URL_RESET_DEFAULTACCOUNT}/${userId}`;
      fetch(url, {
        method: "GET"
      }).then(result => {
        console.log(result);
        const urlRedirect = `${config.url.URL_SELECT_ACCOUNT}/user/${userId}/encrypt/0`;
        signOut(urlRedirect);
      });
    }
  }

  renderInboxViewport() {
    const { leftSideBar } = this.state;
    const { lexon } = this.props;

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
            zIndex: 100,
            overflowY: "hidden",
            WebkitTransition: "-webkit-transform 0s",
            willChange: "transform"
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
            transition: "left .0s ease-out, right .0s ease-out"
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
          <Header
            microsoftUser={this.props.User}
            onSignout={this.onSignout}
            setSearchQuery={this.props.setSearchQuery}
            getLabelMessages={this.getLabelMessages}
            searchQuery={this.props.searchQuery}
          />
          <section className="main hbox space-between">
            <Sidebar
              sideBarCollapsed={leftSideBar.collapsed}
              sideBarToggle={this.toggleSideBar}
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
                  path="/compose"
                  component={() => (
                    <ComposeMessage
                      history={this.props.history}
                      sideBarCollapsed={leftSideBar.collapsed}
                      sideBarToggle={this.toggleSideBar}
                    />
                  )}
                />
                <Route exact path="/notfound" component={NotFound} />
                <Route
                  exact
                  path="/:id([a-zA-Z0-9!@#$%^&+=_-]+)"
                  component={() => (
                    <MessageContent
                      sideBarCollapsed={leftSideBar.collapsed}
                      sideBarToggle={this.toggleSideBar}
                    />
                  )}
                />
              </Switch>
            </article>

            <div className="productpanel">
              <span className="productsbutton">
                <div onClick={() => this.onSetSidebarOpenLexon(true)}>
                  <img
                    className={lexon.user ? "imgproduct" : "imgproductdisable"}
                    border="0"
                    alt="Lex-On"
                    src="assets/img/icon-lexon.png"
                  ></img>
                </div>
              </span>
              <span className="productsbutton">
                <div onClick={() => this.onSetSidebarOpenQMemento(true)}>
                  <img
                    className="imgproduct"
                    border="0"
                    alt="Calendar"
                    src="assets/img/icon-qmemento.png"
                  ></img>
                </div>
              </span>
              <span className="productsbutton">
                <div onClick={() => this.onSetSidebarOpenCompliance(true)}>
                  <img
                    className="imgproduct"
                    border="0"
                    alt="Calendar"
                    src="assets/img/icon-compliance.png"
                  ></img>
                </div>
              </span>
              <span className="productsbutton">
                <div onClick={() => this.onSetSidebarOpenCalendar(true)}>
                  <img
                    className="imgproduct"
                    border="0"
                    alt="Calendar"
                    src="assets/img/icon-calendar.png"
                  ></img>
                </div>
              </span>
              {/* <span className="productsbutton">
                <button
                  onClick={() => this.onSetSidebarDocked(false)}
                  className="btn compose-btn"
                >
                  <img
                    className=""
                    border="0"
                    alt="Calendar"
                    src="assets/img/icon-close-empty.png"
                  ></img>
                </button>
              </span> */}

              <span className="spaceproduct"></span>
            </div>
          </section>
        </Fragment>
      </SidebarCnn>
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
  searchQuery: state.searchQuery,
  lexon: state.lexon,
  selectedMessages: state.messageList.selectedMessages
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
