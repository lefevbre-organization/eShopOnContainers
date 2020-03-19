/* eslint-disable indent */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as uuid from 'uuid/v4';
import Cookies from 'js-cookie';
import history from '../routes/history';
import Spinner from './spinner/spinner';
import TopBar from './top-bar/top-bar';
import MainBar from './main-bar/main-bar';
import SideBar from './side-bar/side-bar';
import MessageEditor from './message-editor/message-editor';
import MessageList from './message-list/message-list';
import MessageViewer from './message-viewer/message-viewer';
import MessageSnackbar from './message-snackbar/message-snackbar';
import NotFoundSnackbar from './messageNotFound-snackbar/messageNotFound-snackbar';

import {
  clearUserCredentials,
  selectMessage,
  selectFolder,
  outboxEventNotified,
  editMessage,
  setError
} from '../actions/application';
import { clearSelected, setSelected } from '../actions/messages';
import {
  setEmailShown,
  resetIdEmail,
  setCaseFile,
  setGUID,
  setSign
} from '../actions/lexon';

import { getSelectedFolder } from '../selectors/folders';

import { AuthenticationException } from '../services/fetch';
import { editNewMessage, clearSelectedMessage } from '../services/application';
import { getFolders, findSentFolder } from '../services/folder';
import { resetFolderMessagesCache } from '../services/message';
import { readMessage } from '../services/message-read';
import { persistApplicationNewMessageContent } from '../services/indexed-db';

import {
  addOrUpdateAccount,
  getUser,
  classifyEmail
} from '../services/accounts';
// import SplitPane from "react-split-pane";
import styles from './app.scss';
import IconButton from './buttons/icon-button';
import { translate } from 'react-i18next';

// import { start, registerApplication } from "single-spa";

// import * as singleSpa from "single-spa";
// import { registerLexonApp } from "../apps/lexonconn-app";
// import { registerMainnavApp } from "../apps/mainnav-app";

import Sidebar from 'react-sidebar';
import LexonComponent from '../apps/lexon_content';
import CalendarComponent from '../apps/calendar_content';
import DataBaseComponent from '../apps/database_content';
import { PROVIDER } from '../constants';

const MESSAGENOTFOUND_SNACKBAR_DURATION = 4000;

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
        <img
          border='0'
          alt='Lefebvre'
          src='/assets/images/lexon-fake.png'></img>
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
        border='0'
        alt='Lefebvre'
        src='/assets/images/lexon-fake-null.png'></img>
    );
    this.setState({ sidebarComponent: lexon });
    this.setState({ sidebarDocked: open });
  }

  onSetSidebarOpenDatabase(open) {
    const lexon = (
      <img
        border='0'
        alt='Lefebvre'
        src='/assets/images/lexon-fake-null.png'></img>
    );
    this.setState({ sidebarComponent: lexon });
    this.setState({ sidebarDocked: open });
  }

  onSetSidebarDocked(open) {
    this.setState({ sidebarDocked: open });
  }

  sendMessagePutUser(user) {
    const { selectedMessages } = this.props.messages;
    console.log('messages ->', this.props.messages);
    window.dispatchEvent(
      new CustomEvent('PutUserFromLexonConnector', {
        detail: {
          user,
          selectedMessages: selectedMessages,
          idCaseFile: this.props.lexon.idCaseFile,
          bbdd: this.props.lexon.bbdd,
          idCompany: this.props.lexon.idCompany,
          idEmail: this.props.lexon.idEmail,
          idFolder: this.props.lexon.idFolder,
          account: this.props.all.login.formValues.user,
          provider: 'IMAP'
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
            background: 'white',
            zIndex: 999,
            overflowY: 'hidden',
            WebkitTransition: '-webkit-transform 0s',
            willChange: 'transform'
          },
          content: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflowY: 'hidden',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            transition: 'left .0s ease-out, right .0s ease-out'
          },
          overlay: {
            zIndex: 1,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0,
            visibility: 'hidden',
            //transition: "opacity .3s ease-out, visibility .0s ease-out",
            backgroundColor: 'rgba(0,0,0,.3)'
          },
          dragHandle: {
            zIndex: 1,
            position: 'fixed',
            top: 0,
            bottom: 0
          }
        }}>
        <div>
          <MainBar
            sideBarCollapsed={sideBar.collapsed}
            sideBarToggle={this.toggleSideBar}
          />
          <TopBar
            sideBarCollapsed={sideBar.collapsed}
            sideBarToggle={this.toggleSideBar}
          />
          <div id='mainnav-app' />
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
            <div id='mainnav-app' />

            <div
              className={`${styles['content-wrapper']}
                                ${
                                  sideBar.collapsed
                                    ? ''
                                    : styles['with-side-bar']
                                } ${styles['custom-padding-top']}`}>
              {this.renderContent()}
            </div>

            <div className={styles.productpanel}>
              <span
                className={styles.productsbutton}
                isotip={t('productBar.lexon')}
                isotip-position='bottom-end'
                isotip-size='small'>
                {lexon.user ? (
                  <IconButton onClick={() => this.onSetSidebarOpenLexon(true)}>
                    <img
                      border='0'
                      alt='Lex-On'
                      src='/assets/images/icon-lexon.png'></img>
                  </IconButton>
                ) : (
                  <IconButton>
                    <img
                      disabled
                      border='0'
                      alt='Lex-On'
                      src='/assets/images/icon-lexon.png'></img>
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
            <NotFoundSnackbar />
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
    this.props.history.push('/#/lexon-connector');
  }

  renderContent() {
    const { application } = this.props;
    if (
      application.newMessage &&
      Object.keys(application.newMessage).length > 0
    ) {
      return <MessageEditor className={styles['message-viewer']} />;
    } else if (
      application.selectedMessage &&
      Object.keys(application.selectedMessage).length > 0
    ) {
      return <MessageViewer className={styles['message-viewer']} />;
    }
    return (
      <Fragment>
        <MessageList className={styles['message-grid']} />
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

  async componentDidMount() {
    document.title = this.props.application.title;
    //Starting poll to update the inbox automatically
    this.startPoll();
    //adding connector App to right slide panel
    //setTimeout(function () { this.registerConnectorApp(); }, 2200);
    this.registerConnectorApp();

    const {
      userId,
      idCaseFile,
      bbdd,
      idEmail,
      idFolder,
      account,
      mailContacts
    } = this.props.lexon;
    const {
      imapSsl,
      serverHost,
      serverPort,
      smtpHost,
      smtpPort,
      smtpSsl,
      user,
      password
    } = this.props.all.login.formValues;
    const { email } = this.props;
    if (userId !== null && email !== null) {
      const userAux = await getUser(userId);

      let sign = '';
      const ac = userAux.data.accounts.filter(a => a.email === email);
      if (ac.length >= 1) {
        sign = ac[0].sign;
      }

      const GUID = uuid();
      const newAccount = {
        provider: PROVIDER,
        email: email,
        guid: GUID,
        defaultAccount: true,
        sign,
        configAccount: {
          imap: serverHost,
          imapPort: serverPort,
          imapUser: user,
          imapPass: password,
          imapSsl: imapSsl,
          smtp: smtpHost,
          smtpPort: smtpPort,
          smtpSsl: smtpSsl
        }
      };
      if (!newAccount.configAccount.imapPass) {
        delete newAccount.configAccount;
      }
      debugger
      addOrUpdateAccount(userId, newAccount)
        .then(() => {
          this.setState({ isUpdatedDefaultAccount: true });
          Cookies.set(`Lefebvre.DefaultAccount.${userId}`, GUID, {
            domain: 'lefebvre.es'
          });
          this.props.setGUID(GUID);
          this.props.setSign(sign);
        })
        .catch(error => {
          console.log('error =>', error);
        });
      if (
        idCaseFile !== null &&
        idCaseFile !== undefined &&
        idEmail == undefined
      ) {
        this.props.newMessage([], sign);
        this.onSetSidebarOpenLexon(true);
      } else if (mailContacts) {
        this.props.newMessage(mailContacts.split(','), sign);
        this.onSetSidebarOpenLexon(true);
      } else if (idEmail) {
        console.log('**************** Ha llegado un id de email');
        console.log(this.state);
        console.log(this.props);

        if (Object.entries(this.props.folders.explodedItems).length > 0) {
          var folderIdentifier = undefined;
          var targetFolder = undefined;
          const explodedItems = Object.entries(
            this.props.folders.explodedItems
          );

          explodedItems.some(folder => {
            if (folder[1].fullName.toUpperCase() === idFolder.toUpperCase()) {
              console.log('*************** FOLDER FOUND');
              targetFolder = folder[1];
              folderIdentifier = folder[0];
              console.log('*************** FOLDER ID: ' + folderIdentifier);
            }
            return folder[1].fullName.toUpperCase() === idFolder.toUpperCase();
          });

          if (targetFolder) {
            this.props.selectFolder(targetFolder);
            this.sleep(500).then(() => {
              const messages = Array.from(
                this.props.messages.cache[
                  this.props.application.selectedFolderId
                ].values()
              );
              const message = messages.find(e => e.messageId === idEmail);
              console.log({ messages });

              if (message) {
                console.log(
                  '**************************** MESSAGE FOUND:' + message.uid
                );
                if (
                  this.props.application.newMessage &&
                  Object.keys(this.props.application.newMessage).length > 0
                ) {
                  this.props.close();
                }
                this.props.messageClicked(message);
                this.props.setEmailShown(true);
                this.onSetSidebarOpenLexon(true);
              } else {
                this.onSetSidebarOpenLexon(true);
                this.renderNotFoundModal();
                //window.alert("No se ha encontrado el mensaje en el servidor");
              }
            });
          } else {
            //window.alert("No se ha encontrado el mensaje en el servidor");
            this.onSetSidebarOpenLexon(true);
            this.renderNotFoundModal();
          }
        }
      } else if (bbdd) {
        this.onSetSidebarOpenLexon(true);
      }
    } else {
      this.setState({ isUpdatedDefaultAccount: true });
    }

    window.addEventListener(
      'GetUserFromLexonConnector',
      this.handleGetUserFromLexonConnector
    );

    window.addEventListener('RemoveSelectedDocument', event => {
      const messages = [event.detail].map(msg => ({
        ...msg,
        messageId: msg.id
      }));
      this.props.setSelected(messages, false, event.detail.folder);

      dispatchEvent(
        new CustomEvent('Checkclick', {
          detail: {
            id: event.detail.id,
            extMessageId: event.detail.id,
            name: event.detail.id,
            subject: event.detail.subject,
            sentDateTime: event.detail.sentDateTime,
            folder: event.detail.folder,
            provider: 'GOOGLE',
            account: this.props.lexon.account,
            chkselected: false
          }
        })
      );
    });

    console.log('ENVIRONMENT ->', window.REACT_APP_ENVIRONMENT);
  }

  renderNotFoundModal() {
    this.props.setError('messageNotFound', 'No se encuentra el mensaje'); //tenia authentication
    setTimeout(
      () => this.props.setError('messageNotFound', null),
      MESSAGENOTFOUND_SNACKBAR_DURATION
    );
    this.props.resetIdEmail();
    if (
      this.props.lexon.idCaseFile !== null &&
      this.props.lexon.idCaseFile !== undefined
    ) {
      window.dispatchEvent(new CustomEvent('RemoveCaseFile'));
      this.props.setCaseFile({
        casefile: null,
        bbdd: this.props.lexon.bbdd,
        company: this.props.lexon.company
      });
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async componentDidUpdate() {
    if (
      this.props.lexon.userId !== '' &&
      this.props.outbox &&
      this.props.outbox.sent &&
      !this.props.outbox.eventNotified
    ) {
      this.sentEmail(
        this.props.outbox.idMessage,
        this.props.outbox.message.subject
      );

      if (this.props.lexon.bbdd && this.props.email) {
        try {
          const user = await getUser(this.props.lexon.userId);

          if (user && user.data && user.data.configUser) {
            console.log(user)
            
            if (user.data.configUser.getContacts === true) {
              const emailDate = new Date()
                .toISOString()
                .replace(/T/, ' ')
                .replace(/\..+/, '');


              const folder = findSentFolder(this.props.folders);

              console.log(folder.fullName)
              debugger;
              await classifyEmail(
                this.props.outbox.idMessage,
                this.props.outbox.message.subject,
                emailDate,
                this.props.outbox.message.recipients.map(rec => rec.address),
                folder.fullName,
                this.props.lexon.provider,
                this.props.email,
                this.props.lexon.bbdd,
                user.data.lexonUserId
              );
            }
          }
        } catch (err) {
          console.log(err)
          debugger
          //throw err;
        }
      }

      this.props.outboxEventNotified();
    } else {
      this.startPoll();
    }
  }

  componentWillUnmount() {
    clearTimeout(this.refreshPollTimeout);

    window.removeEventListener(
      'GetUserFromLexonConnector',
      this.handleGetUserFromLexonConnector
    );
  }

  sentEmail(id, subject) {
    const sentFolder = findSentFolder(this.props.folders);

    window.dispatchEvent(
      new CustomEvent('SentMessage', {
        detail: {
          idEmail: id,
          subject: subject,
          date: new Date()
            .toISOString()
            .replace(/T/, ' ')
            .replace(/\..+/, ''),
          folder: sentFolder.fullName,
          //folder: this.props.application.selectedFolderId,
          account: this.props.all.login.formValues.user,
          provider: 'IMAP'
        }
      })
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
      if (this.props.lexon.idEmail && !this.props.lexon.emailShown) {
        const folderPromise = this.props.reloadFolders();
        await Promise.all([folderPromise]);

        if (Object.entries(this.props.folders.explodedItems).length > 0) {
          var folderIdentifier = undefined;
          var targetFolder = undefined;
          const explodedItems = Object.entries(
            this.props.folders.explodedItems
          );

          explodedItems.some(folder => {
            if (
              folder[1].fullName.toUpperCase() ===
              this.props.lexon.idFolder.toUpperCase()
            ) {
              console.log('*************** FOLDER FOUND2');
              targetFolder = folder[1];
              folderIdentifier = folder[0];
              console.log('*************** FOLDER ID2: ' + folderIdentifier);
            }
            return (
              folder[1].fullName.toUpperCase() ===
              this.props.lexon.idFolder.toUpperCase()
            );
          });

          if (targetFolder) {
            this.props.selectFolder(targetFolder);
            this.sleep(2000).then(() => {
              const messages = Array.from(
                this.props.messages.cache[
                  this.props.application.selectedFolderId
                ].values()
              );
              const message = messages.find(
                e => e.messageId === this.props.lexon.idEmail
              );
              console.log({ messages });

              if (message) {
                console.log(
                  '**************************** MESSAGE FOUND2:' + message.uid
                );
                this.props.messageClicked(message);
                this.onSetSidebarOpenLexon(true);
              } else {
                console.log('**************************** MESSAGE NOT FOUND2:');
                this.renderNotFoundModal();
              }
              this.props.setEmailShown(true);
            });
          }
        }
      } else {
        const folderPromise = this.props.reloadFolders();
        const selectedFolder =
          this.props.folders.explodedItems[
            this.props.application.selectedFolderId
          ] || {};
        const messagePromise = this.props.reloadMessageCache(selectedFolder);
        await Promise.all([folderPromise, messagePromise]);
      }
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
  loadMessageByFolder: PropTypes.func,
  newMessage: PropTypes.func.isRequired,
  resetIdEmail: PropTypes.func
};

const mapStateToProps = state => ({
  application: state.application,
  outbox: state.application.outbox,
  folders: state.folders,
  receivedFolder: getSelectedFolder(state) || {},
  messages: state.messages,
  lexon: state.lexon,
  email: state.login.formValues.user,
  all: state
});

const mapDispatchToProps = dispatch => ({
  reloadFolders: credentials => getFolders(dispatch, credentials, true),
  reloadMessageCache: (user, folder) =>
    resetFolderMessagesCache(dispatch, user, folder),
  newMessage: (to, sign) => editNewMessage(dispatch, to, sign),
  selectFolder: (folder, user) => {
    dispatch(selectFolder(folder));
    clearSelectedMessage(dispatch);
    dispatch(clearSelected());
    resetFolderMessagesCache(dispatch, user, folder);
  },
  messageClicked: (credentials, downloadedMessages, folder, message) => {
    dispatch(selectMessage(message));
    readMessage(dispatch, credentials, downloadedMessages, folder, message);
  },
  setEmailShown: flag => dispatch(setEmailShown(flag)),
  outboxEventNotified: () => dispatch(outboxEventNotified()),
  logout: () => {
    dispatch(clearUserCredentials());
    history.push('/login');
  },
  close: application => {
    dispatch(editMessage(null));
    //persistApplicationNewMessageContent(application, "");
  },
  setError: (err, msg) => dispatch(setError(err, msg)),
  resetIdEmail: () => dispatch(resetIdEmail()),
  setCaseFile: casefile => dispatch(setCaseFile(casefile)),
  setSelected: (messages, selected, shiftKey) =>
    dispatch(setSelected(messages, selected, shiftKey)),
  setGUID: guid => dispatch(setGUID(guid)),
  setSign: sign => dispatch(setSign(sign))
});

const mergeProps = (stateProps, dispatchProps, ownProps) =>
  Object.assign({}, stateProps, dispatchProps, ownProps, {
    reloadFolders: () =>
      dispatchProps.reloadFolders(stateProps.application.user.credentials),
    reloadMessageCache: folder =>
      dispatchProps.reloadMessageCache(stateProps.application.user, folder),
    selectFolder: folder =>
      dispatchProps.selectFolder(folder, stateProps.application.user),
    messageClicked: message =>
      dispatchProps.messageClicked(
        stateProps.application.user.credentials,
        stateProps.application.downloadedMessages,
        stateProps.receivedFolder,
        message
      ),
    setEmailShown: flag => dispatchProps.setEmailShown(flag),
    outboxEventNotified: () => dispatchProps.outboxEventNotified(),
    close: application => dispatchProps.close(stateProps.application),
    setError: (err, msg) => dispatchProps.setError(err, msg),
    resetIdEmail: () => dispatchProps.resetIdEmail(),
    setCaseFile: casefile => dispatchProps.setCaseFile(casefile)
  });

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(translate()(App));
