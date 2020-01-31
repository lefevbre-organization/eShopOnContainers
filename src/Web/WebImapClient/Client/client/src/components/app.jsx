/* eslint-disable indent */
import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import * as uuid from 'uuid/v4';
import Cookies from 'js-cookie';
import history from "../routes/history";
import Spinner from "./spinner/spinner";
import TopBar from "./top-bar/top-bar";
import MainBar from "./main-bar/main-bar";
import SideBar from "./side-bar/side-bar";
import MessageEditor from "./message-editor/message-editor";
import MessageList from "./message-list/message-list";
import MessageViewer from "./message-viewer/message-viewer";
import MessageSnackbar from "./message-snackbar/message-snackbar";
import { clearUserCredentials } from "../actions/application";
import { AuthenticationException } from "../services/fetch";
import { editNewMessage } from "../services/application";
import { getFolders } from "../services/folder";
import { resetFolderMessagesCache } from "../services/message";
// import SplitPane from "react-split-pane";
import styles from "./app.scss";
import IconButton from "./buttons/icon-button";
import { translate } from "react-i18next";

// import { start, registerApplication } from "single-spa";

// import * as singleSpa from "single-spa";
// import { registerLexonApp } from "../apps/lexonconn-app";
// import { registerMainnavApp } from "../apps/mainnav-app";

import Sidebar from "react-sidebar";
import LexonComponent from "../apps/lexon_content";
import CalendarComponent from "../apps/calendar_content";
import DataBaseComponent from "../apps/database_content";
import { PROVIDER } from "../constants";

// const activityFunction = location => location.pathname.startsWith('/lexon-connector');

// registerApplication('lex-on-connector', () => import('../lex-on_connector/index.js'), activityFunction);
// start();

// const hashPrefix = prefix => location => location.hash.startsWith(`#${prefix}`)

// registerApplication('lex-on-connector_debug', () => import('../lex-on_connector/index.js'), hashPrefix('/lexon-connector'))

// start()

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sidebarOpen: false,
      sidebarDocked: false,
      sideBar: {
        collapsed: false
      },
      sidebarComponent: (
        <img border="0" alt="Lefebvre" src="assets/images/lexon-fake.png"></img>
      ),
      actualSidebarComponent: 0,
      isUpdatedDefaultAccount: false
    };

    this.toggleSideBar = this.toggleSideBar.bind(this);
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
  }

  onSetSidebarOpenCalendar(open) {
    this.setState({
      sidebarComponent: (
        <CalendarComponent sidebarDocked={this.onSetSidebarDocked} />
      )
    });
    this.setState({ sidebarDocked: open });
  }

  onSetSidebarOpenLexon(open) {
    this.setState({
      sidebarComponent: (
        <LexonComponent sidebarDocked={this.onSetSidebarDocked} />
      )
    });
    this.setState({ sidebarDocked: open });
    this.setState({ actualSidebarComponent: 1 });
  }

  onSetSidebarOpenQMemento(open) {
    this.setState({
      sidebarComponent: (
        <DataBaseComponent sidebarDocked={this.onSetSidebarDocked} />
      )
    });
    this.setState({ sidebarDocked: open });
  }

  onSetSidebarOpenCompliance(open) {
    const lexon = (
      <img
        border="0"
        alt="Lefebvre"
        src="assets/images/lexon-fake-null.png"
      ></img>
    );
    this.setState({ sidebarComponent: lexon });
    this.setState({ sidebarDocked: open });
  }

  onSetSidebarOpenDatabase(open) {
    const lexon = (
      <img
        border="0"
        alt="Lefebvre"
        src="assets/images/lexon-fake-null.png"
      ></img>
    );
    this.setState({ sidebarComponent: lexon });
    this.setState({ sidebarDocked: open });
  }

  onSetSidebarDocked(open) {
    this.setState({ sidebarDocked: open });
  }

  sendMessagePutUser(user) {
    const { selectedMessages } = this.props.messages;
    console.log("messages ->", this.props.messages);
    window.dispatchEvent(
      new CustomEvent("PutUserFromLexonConnector", {
        detail: {
          user,
          selectedMessages: selectedMessages,
          idCaseFile: this.props.lexon.idCaseFile,
          bbdd: this.props.lexon.bbdd,
          idCompany: this.props.lexon.idCompany
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

  render() {
    const { t, lexon } = this.props;
    const { sideBar, isUpdatedDefaultAccount } = this.state;

    if (!isUpdatedDefaultAccount) {
      return null;
    }

    return (
      <Sidebar
        sidebar={this.state.sidebarComponent}
        open={false}
        pullRight={true}
        docked={this.state.sidebarDocked}
        styles={{
          sidebar: {
            background: "white",
            zIndex: 999,
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
        <div>
          <MainBar
            sideBarCollapsed={sideBar.collapsed}
            sideBarToggle={this.toggleSideBar}
          />
          <TopBar
            sideBarCollapsed={sideBar.collapsed}
            sideBarToggle={this.toggleSideBar}
          />
          <div id="mainnav-app" />
          {/*<SplitPane split="vertical" minSize={200} maxSize={800} defaultSize={450}  primary="second">*/}
          <div className={styles.app}>
            <Spinner
              visible={this.props.application.activeRequests > 0}
              className={styles.spinner}
              pathClassName={styles.spinnerPath}
            />

            <SideBar
              collapsed={sideBar.collapsed}
              sideBarToggle={this.toggleSideBar}
              casefile={lexon.idCaseFile}
              bbdd={lexon.bbdd}
            />
            <div id="mainnav-app" />

            <div
              className={`${styles["content-wrapper"]}
                                ${
                                  sideBar.collapsed
                                    ? ""
                                    : styles["with-side-bar"]
                                } ${styles["custom-padding-top"]}`}
            >
              {this.renderContent()}
            </div>

            <div className={styles.productpanel}>
              <span
                className={styles.productsbutton}
                isotip={t("productBar.lexon")}
                isotip-position="bottom-end"
                isotip-size="small"
              >
                {lexon.user ? (
                  <IconButton onClick={() => this.onSetSidebarOpenLexon(true)}>
                    <img
                      border="0"
                      alt="Lex-On"
                      src="assets/images/icon-lexon.png"
                    ></img>
                  </IconButton>
                ) : (
                  <IconButton>
                    <img
                      disabled
                      border="0"
                      alt="Lex-On"
                      src="assets/images/icon-lexon.png"
                    ></img>
                  </IconButton>
                )}
                <div className={styles.btnselect}></div>
              </span>
              {/* <span
                className={styles.productsbutton}
                isotip={t("productBar.database")}
                isotip-position="bottom-end"
                isotip-size="small"
              >
                 <IconButton onClick={() => this.onSetSidebarOpenQMemento(true)}> 
                <IconButton>
                  <img
                    border="0"
                    alt="Calendar"
                    src="assets/images/icon-qmemento.png"
                    className="disabledimg"
                  ></img>
                </IconButton>
                <div className={styles.btnselect}></div>
              </span>
              <span
                className={styles.productsbutton}
                isotip-position="bottom-end"
                isotip-size="small"
              >
                {/* <IconButton
                  disabled
                  onClick={() => this.onSetSidebarOpenCompliance(true)}
                > 
                <IconButton>
                  <img
                    border="0"
                    alt="Calendar"
                    src="assets/images/icon-compliance.png"
                    className="disabledimg"
                  ></img>
                </IconButton>
                <div className={styles.btnselect}></div>
              </span>
              <span
                className={styles.productsbutton}
                isotip={t("productBar.calendar")}
                isotip-position="bottom-end"
                isotip-size="small"
              >
                <IconButton onClick={() => this.onSetSidebarOpenCalendar(true)}> 
                <IconButton>
                  <img
                    border="0"
                    alt="Calendar"
                    src="assets/images/icon-calendar.png"
                    className="disabledimg"
                  ></img>
                </IconButton>
                <div className={styles.btnselect}></div>
              </span>
              {/* <span
                className={styles.productsbutton}
                isotip={t("sideBar.hide")}
                isotip-position="bottom-end"
                isotip-size="small"
              >
                <IconButton onClick={() => this.onSetSidebarDocked(false)}>
                  close
                </IconButton>
                <div className={styles.btnselect}></div>
              </span>

              <span className={styles.spaceproduct}></span>*/}
            </div>

            <MessageSnackbar />
          </div>

          {/*<div className={styles.connector}  style={{
                      backgroundImage: 'url(' + imgUrl + ')',
                      backgroundSize: '120px',
                      backgroundPosition: 'center 110px',
                      backgroundRepeat: 'no-repeat',
                      height: '100%'
                  }}>
                      <div id="lexon-app" className={styles.panelconnectortitle}>
                      </div>
                      <div id="lexon-app-dev" className={styles.panelconnectortitle}>
                      </div>

                  </div>*/}
          {/*</SplitPane>*/}
        </div>
      </Sidebar>
    );
  }

  renderConnector() {
    this.props.history.push("/#/lexon-connector");
  }

  renderContent() {
    const { application } = this.props;
    if (
      application.newMessage &&
      Object.keys(application.newMessage).length > 0
    ) {
      return <MessageEditor className={styles["message-viewer"]} />;
    } else if (
      application.selectedMessage &&
      Object.keys(application.selectedMessage).length > 0
    ) {
      return <MessageViewer className={styles["message-viewer"]} />;
    }
    return (
      <Fragment>
        <MessageList className={styles["message-grid"]} />
        {/*<div className={styles["fab-container"]}>
          {outbox === null ? (
            <button
              className={`${mainCss["mdc-fab"]} ${mainCss["mdc-button--raised"]}`}
            >
              <span className={`material-icons ${mainCss["mdc-fab__icon"]}`}>
                chat_bubble_outline
              </span>
            </button>
          ) : null}
        </div>*/}
      </Fragment>
    );
  }

  registerConnectorApp() {
    // let el = document.getElementById('main-lexon-connector')
    // if (!el) {
    //     try {
    //         const activityFunction = location => location.pathname.startsWith('/');
    //         registerApplication('lexon-app-dev', () => import('../lex-on_connector/index.js'), activityFunction);
    //         start();
    //         //registerLexonApp();
    //         registerMainnavApp();
    //         //singleSpa.start();
    //     }
    //     catch (error) {
    //         //console.error(error);
    //     }
    // }
  }

  componentDidMount() {
    document.title = this.props.application.title;
    //Starting poll to update the inbox automatically
    this.startPoll();
    //adding connector App to right slide panel
    //setTimeout(function () { this.registerConnectorApp(); }, 2200);
    this.registerConnectorApp();

    const { userId, idCaseFile, bbdd } = this.props.lexon;
    const { email } = this.props;
    if (userId !== null && email !== null) {
      const GUID = uuid();
      const url = `${window.URL_UPDATE_DEFAULTACCOUNT}/${userId}/${email}/${PROVIDER}/${GUID}`;
      fetch(url, {
        method: "GET"
      })
      .then(() => {
        this.setState({ isUpdatedDefaultAccount: true });
      	Cookies.set(`Lefebvre.DefaultAccount.${userId}`, GUID, { domain: 'lefebvre.es' })
      })
      .catch(error => {
        console.log("error =>", error);
      });
      if (idCaseFile !== null && idCaseFile !== undefined) {
        this.props.newMessage();
        this.onSetSidebarOpenLexon(true);
      }
      else if (bbdd){
        //this.props.newMessage();
        this.onSetSidebarOpenLexon(true);
      }
    } else {
      this.setState({ isUpdatedDefaultAccount: true });
    }

    window.addEventListener(
      "GetUserFromLexonConnector",
      this.handleGetUserFromLexonConnector
    );

    console.log("ENVIRONMENT ->", window.REACT_APP_ENVIRONMENT);
  }

  componentDidUpdate() {
    this.startPoll();
  }

  componentWillUnmount() {
    clearTimeout(this.refreshPollTimeout);

    window.removeEventListener(
      "GetUserFromLexonConnector",
      this.handleGetUserFromLexonConnector
    );
  }

  startPoll() {
    // Start polling when everything is ready
    if (
      this.props.application.selectedFolderId &&
      Object.keys(this.props.folders.explodedItems).length > 0 &&
      !this.pollStarted
    ) {
      this.pollStarted = true;
      this.refreshPoll();
    }
  }

  /**
   * Poll function that will refresh the folder list and the INBOX folder.
   *
   * @returns {Promise<void>}
   */
  async refreshPoll() {
    let keepPolling = true;
    try {
      const folderPromise = this.props.reloadFolders();
      const selectedFolder =
        this.props.folders.explodedItems[
          this.props.application.selectedFolderId
        ] || {};
      const messagePromise = this.props.reloadMessageCache(selectedFolder);
      await Promise.all([folderPromise, messagePromise]);
    } catch (e) {
      console.log(`Error in refresh poll: ${e}`);
      if (e instanceof AuthenticationException) {
        keepPolling = false;
        this.props.logout();
      }
    }
    if (keepPolling) {
      this.refreshPollTimeout = setTimeout(
        this.refreshPoll.bind(this),
        this.props.application.pollInterval
      );
    }
  }

  toggleSideBar() {
    const toggleCollapsed = !this.state.sideBar.collapsed;
    this.setState({
      sideBar: {
        collapsed: toggleCollapsed
      }
    });
  }
}

App.propTypes = {
  application: PropTypes.object,
  outbox: PropTypes.object,
  folders: PropTypes.object,
  reloadFolders: PropTypes.func,
  reloadMessageCache: PropTypes.func,
  newMessage: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  application: state.application,
  outbox: state.application.outbox,
  folders: state.folders,
  messages: state.messages,
  lexon: state.lexon,
  email: state.login.formValues.user,
  all: state
});

const mapDispatchToProps = dispatch => ({
  reloadFolders: credentials => getFolders(dispatch, credentials, true),
  reloadMessageCache: (user, folder) =>
    resetFolderMessagesCache(dispatch, user, folder),
  newMessage: () => editNewMessage(dispatch),
  logout: () => {
    dispatch(clearUserCredentials());
    history.push("/login");
  }
});

const mergeProps = (stateProps, dispatchProps, ownProps) =>
  Object.assign({}, stateProps, dispatchProps, ownProps, {
    reloadFolders: () =>
      dispatchProps.reloadFolders(stateProps.application.user.credentials),
    reloadMessageCache: folder =>
      dispatchProps.reloadMessageCache(stateProps.application.user, folder)
  });

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(translate()(App));
