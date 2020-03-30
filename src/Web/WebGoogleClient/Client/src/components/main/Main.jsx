import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import * as uuid from 'uuid/v4';
import * as base64 from 'base-64';
import ACTIONS from '../../actions/lexon';

import {
  diff,
  addedDiff,
  deletedDiff,
  updatedDiff,
  detailedDiff
} from 'deep-object-diff';
import Cookies from 'js-cookie';
import Header from '../header/Header';
import Sidebar from '../sidebar/Sidebar';
import NotFound from '../not-found/NotFound';
import { Notification } from '../notification/';
import './main.scss';
import MessageList from '../content/message-list/MessageList';
import MessageContent from '../content/message-list/message-content/MessageContent';
import { Route, Switch, withRouter } from 'react-router-dom';
import { getLabels } from '../sidebar/sidebar.actions';
import ComposeMessage from '../compose-message/ComposeMessage';
import {
  getLabelMessages,
  emptyLabelMessages,
  toggleSelected,
  setPageTokens,
  addInitialPageToken,
  clearPageTokens,
  setSearchQuery,
  deleteMessage
} from '../content/message-list/actions/message-list.actions';

import { selectLabel } from '../sidebar/sidebar.actions';
import { signOut } from '../../api/authentication';
import { signOutDisconnect } from '../../api/authentication';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import SidebarCnn from 'react-sidebar';
import LexonComponent from '../../apps/lexon_content';
import CalendarComponent from '../../apps/calendar_content';
import 'react-reflex/styles.css';
import {
  addOrUpdateAccount,
  resetDefaultAccount,
  getUser
} from '../../api/accounts';
import { PROVIDER } from '../../constants';
import { getMessageListWithRFC } from '../../api/';

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
    this.onSignoutDisconnect = this.onSignoutDisconnect.bind(this);
    this.loadLabelMessageSingle = this.loadLabelMessageSingle.bind(this);

    //this.leftSidebarOpen = leftSidebarOpen;

    this.state = {
      isVisible: true,
      fluid: true,
      customAnimation: false,
      slow: false,
      size: 0.25,
      sidebarOpen: false,
      sidebarDocked: false,
      googleDown: false,
      showNotification: false,
      messageNotification: '',
      leftSideBar: {
        collapsed: false
      },
      sidebarComponent: (
        <img border='0' alt='Lefebvre' src='assets/img/lexon-fake.png'></img>
      )
    };

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

  //handleShowLeftSidebarClick() {
  //    this.setState({
  //        leftSidebarOpen: !this.leftSidebarOpen
  //    })
  //}

  sendMessagePutUser(user) {
    const { selectedMessages, googleUser } = this.props;

    window.dispatchEvent(
      new CustomEvent('PutUserFromLexonConnector', {
        detail: {
          user,
          selectedMessages: selectedMessages,
          idCaseFile: this.props.lexon.idCaseFile,
          bbdd: this.props.lexon.bbdd,
          idCompany: this.props.lexon.idCompany,
          provider: this.props.lexon.provider,
          account: googleUser.Rt.Au
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
  }

  onSetSidebarOpenQMemento(open) {
    let lexon = (
      <img border='0' alt='Lefebvre' src='assets/img/lexon-fake-null.png'></img>
    );
    this.setState({ sidebarComponent: lexon });
    this.setState({ sidebarDocked: open });
  }

  onSetSidebarOpenCompliance(open) {
    let lexon = (
      <img border='0' alt='Lefebvre' src='assets/img/lexon-fake-null.png'></img>
    );
    this.setState({ sidebarComponent: lexon });
    this.setState({ sidebarDocked: open });
  }

  onSetSidebarOpenDatabase(open) {
    let lexon = (
      <img border='0' alt='Lefebvre' src='assets/img/lexon-fake-null.png'></img>
    );
    this.setState({ sidebarComponent: lexon });
    this.setState({ sidebarDocked: open });
  }

  onSetSidebarDocked(open) {
    this.setState({ sidebarDocked: open });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const difP = detailedDiff(this.props, nextProps);
    const difSt = detailedDiff(this.state, nextState);

    if (
      isEmpty(difP.updated) &&
      isEmpty(difP.added) &&
      isEmpty(difP.deleted) &&
      isEmpty(difSt.updated) &&
      isEmpty(difSt.added) &&
      isEmpty(difSt.deleted)
    ) {
      return false;
    }
    if (
      difP.updated.messagesResult &&
      difP.updated.messagesResult.hasOwnProperty('openMessage')
    ) {
      return false;
    }

    if (
      difP.updated.lexon &&
      difP.updated.lexon.hasOwnProperty('mailContacts')
    ) {
      return false;
    }

    if (
      nextProps.messagesResult.openMessage !== null &&
      nextProps.messagesResult.openMessage ===
        this.props.messagesResult.openMessage
    ) {
      if (
        nextProps.location.pathname ===
        '/' + nextProps.messagesResult.openMessage
      ) {
        if (nextState.sidebarDocked !== this.state.sidebarDocked) {
          return true;
        }

        return false;
      } else {
        return true;
      }
    }

    return true;
  }

  async componentDidMount() {
    /* Label list is fetched from here 
    so that we can declare Routes by labelId 
    before rendering anything else */

    this.getLabelList();

    window.addEventListener('toggleClock', function(event) {
      alert(event.detail.name);
    });
    window.addEventListener(
      'GetUserFromLexonConnector',
      this.handleGetUserFromLexonConnector
    );
    window.addEventListener('RemoveSelectedDocument', event => {
      this.props.deleteMessage(event.detail.id);
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

    const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    const { userId, idCaseFile, bbdd, mailContacts } = this.props.lexon;
    const { googleUser } = this.props;

    if (!googleUser || !googleUser.Rt) {
      this.setState({
        googleDown: true,
        showNotification: true,
        messageNotification: 'El proveedor de Google está caido'
      });
      return;
    }

    //var idEmail64 = this.props.idEmail;
    var idEmail = this.props.idEmail;

    // if (idEmail64 && base64regex.test(idEmail64)){
    //   idEmail = base64.decode(idEmail64);
    // }

    if (idEmail && base64regex.test(idEmail)) {
      idEmail = base64.decode(idEmail);
    }

    const email = googleUser.Rt.Au;

    if (userId !== null && email !== null) {
      const user = await getUser(userId);
      console.log(user);

      let sign = '';
      const account = user.data.accounts.filter(a => a.email === email);
      if (account.length >= 1) {
        sign = account[0].sign;
      }

      const GUID = uuid();
      const newAccount = {
        provider: PROVIDER,
        email: email,
        guid: GUID,
        sign,
        defaultAccount: true,
        configAccount: null,
        mails: []
      };
      addOrUpdateAccount(userId, newAccount).then(result => {
        Cookies.set(`Lefebvre.DefaultAccount.${userId}`, GUID, {
          domain: 'lefebvre.es'
        });
        this.props.setGUID(GUID);
        this.props.setSign(sign);
        if (idEmail != null && idEmail !== undefined) {
          if (
            (idCaseFile != null && idCaseFile != undefined) ||
            (bbdd !== null) & (bbdd !== undefined)
          ) {
            this.onSetSidebarOpenLexon(true);
          }
          if (
            idEmail &&
            idEmail.indexOf('<') !== -1 &&
            idEmail.indexOf('>') !== -1
          ) {
            getMessageListWithRFC(idEmail).then(response => {
              if (
                response &&
                response.result &&
                response.result.messages &&
                response.result.messages.length > 0
              ) {
                console.log(
                  'El messageId:' +
                    idEmail +
                    ' se corresponde con el id Interno:' +
                    response.result.messages[0].id
                );
                idEmail = response.result.messages[0].id;
                this.props.history.push(`/${idEmail}`);
              } else {
                this.setState({
                  googleDown: true,
                  showNotification: true,
                  messageNotification: 'El mensaje no está en el servidor'
                });
                return;
              }
            });
          } else {
            this.props.history.push(`/${idEmail}`);
          }
        } else if (idCaseFile != null && idCaseFile !== undefined) {
          this.onSetSidebarOpenLexon(true);
          this.props.history.push('/compose');
        } else if (mailContacts !== null) {
          this.onSetSidebarOpenLexon(true);
          this.props.history.push('/compose');
        } else if ((bbdd !== null) & (bbdd !== undefined)) {
          this.onSetSidebarOpenLexon(true);
          this.props.history.push('/inbox');
        } else {
          this.props.history.push('/inbox');
        }
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener(
      'GetUserFromLexonConnector',
      this.handleGetUserFromLexonConnector
    );
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.messagesResult.openMessage === '' &&
      prevProps.messagesResult.openMessage !== ''
    ) {
      alert('Cerrado');
    }

    if (prevProps.signedInUser !== this.props.signedInUser) {
      this.setState({
        signedInUser: this.props.signedInUser
      });
    }

    const { labels } = this.props.labelsResult;
    const { pathname } = this.props.location;
    const selectedLabel = labels.find(el => el.selected);
    const labelPathMatch = labels.find(
      el => el.id.toLowerCase() === pathname.slice(1)
    );
    if (!selectedLabel) {
      if (labelPathMatch && this.props.searchQuery === '') {
        this.props.selectLabel(labelPathMatch.id);
      }
    } else {
      if (labelPathMatch && selectedLabel.id !== labelPathMatch.id) {
        this.props.selectLabel(labelPathMatch.id);
      }
    }
  }

  refreshLabels() {
    this.getLabelList();
    this.renderLabelRoutes();
  }

  loadLabelMessageSingle() {
    this.getLabelList();
    this.renderLabelRoutes();
    const { labels } = this.props.labelsResult;
    const selectedLabel = labels.find(el => el.selected);
    this.getLabelMessages({ labelIds: [selectedLabel.id] });
  }

  navigateToNextPage(token) {
    const searchParam = this.props.location.search;
    const currentToken =
      searchParam.indexOf('?') === 0 ? searchParam.slice(1) : '';
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

    if (currentSearchQuery && currentSearchQuery !== '') {
      this.props.setSearchQuery('');
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

  getLabelMessages({ labelIds, q, pageToken }) {
    this.props.emptyLabelMessages();
    this.props.getLabelMessages({ labelIds, q, pageToken });
    //this.registerConnectorApp();
  }

  addInitialPageToken(token) {
    this.props.addInitialPageToken(token);
  }

  renderLabelRoutes() {
    const { leftSideBar } = this.state;
    return this.props.labelsResult.labels.map(el => (
      <Route
        key={el.id + '_route'}
        exact
        path={'/' + el.id}
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
              refresh={() => {
                this.refreshLabels();
              }}
              addInitialPageToken={this.addInitialPageToken}
              parentLabel={that.props.labelsResult.labels.find(
                el => el.id === props.match.path.slice(1)
              )}
              searchQuery={this.props.searchQuery}
              loadLabelMessageSingle={this.loadLabelMessageSingle}
            />
          );
        }}
      />
    ));
  }

  renderSpinner() {
    return (
      <div className='d-flex h-100 align-items-center justify-content-center'>
        <FontAwesomeIcon icon={faSpinner} spin size='3x' />
      </div>
    );
  }

  onSignout() {
    console.log('IN ... onSignout');
    const { userId, token } = this.props.lexon;
    resetDefaultAccount(userId)
      .then(result => {
        signOut();
      })
      .then(_ => {
        const urlRedirect = (token) ? `${window.URL_SELECT_ACCOUNT}/access/${token}/` : `${window.URL_SELECT_ACCOUNT}/user/${userId}/encrypt/0`;
        window.open(urlRedirect, '_self');
      });

    //sessionStorage.clear();
    //localStorage.clear();
  }

  onSignoutDisconnect() {
    console.log('IN ... onSignoutDisconnect');
    const { userId, token } = this.props.lexon;
    resetDefaultAccount(userId)
      .then(result => {
        signOutDisconnect();
      })
      .then(_ => {
        const urlRedirect = (token) ? `${window.URL_SELECT_ACCOUNT}/access/${token}/` : `${window.URL_SELECT_ACCOUNT}/user/${userId}/encrypt/0`;
        window.open(urlRedirect, '_self');
      });

    //sessionStorage.clear();
    //localStorage.clear();
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
        open={this.state.sidebarOpen}
        pullRight={true}
        docked={this.state.sidebarDocked}
        styles={{
          sidebar: {
            background: 'white',
            zIndex: 100,
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
        <Fragment>
          <Header
            googleUser={this.props.googleUser}
            onSignout={this.onSignout}
            onSignoutDisconnect={this.onSignout}
            setSearchQuery={this.props.setSearchQuery}
            getLabelMessages={this.getLabelMessages}
            searchQuery={this.props.searchQuery}
          />
          <section className='main hbox space-between'>
            <Sidebar
              sideBarCollapsed={leftSideBar.collapsed}
              sideBarToggle={this.toggleSideBar}
              getLabelList={this.getLabelList}
              pathname={this.props.location.pathname}
              labelsResult={this.props.labelsResult}
              onLabelClick={this.loadLabelMessages}
              onSidebarCloseClick={this.handleShowLeftSidebarClick}
            />
            <article className='d-flex flex-column position-relative'>
              <Switch>
                {this.renderLabelRoutes()}
                <Route
                  exact
                  path='/compose'
                  component={() => (
                    <ComposeMessage
                      history={this.props.history}
                      sideBarCollapsed={leftSideBar.collapsed}
                      sideBarToggle={this.toggleSideBar}
                      casefile={lexon.idCaseFile}
                      mailContacts={lexon.mailContacts}
                    />
                  )}
                />
                <Route exact path='/notfound' component={NotFound} />
                <Route
                  exact
                  path='/:id([a-zA-Z0-9]+)'
                  component={() => (
                    <MessageContent
                      sideBarCollapsed={leftSideBar.collapsed}
                      sideBarToggle={this.toggleSideBar}
                      refresh={() => {
                        this.refreshLabels();
                      }}
                      notFoundModal={0}
                    />
                  )}
                />
              </Switch>
            </article>

            <div className='productpanel'>
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
              <span className='productsbutton'>
                {lexon.user ? (
                  <div onClick={() => this.onSetSidebarOpenLexon(true)}>
                    <img
                      className='imgproduct'
                      border='0'
                      alt='Lex-On'
                      src='assets/img/icon-lexon.png'></img>
                  </div>
                ) : (
                  <div>
                    <img
                      className='imgproductdisable'
                      border='0'
                      alt='Lex-On'
                      src='assets/img/icon-lexon.png'></img>
                  </div>
                )}
              </span>
              
             {/* <span className="productsbutton">
                 <div onClick={() => this.onSetSidebarOpenQMemento(true)}> 
                <div>
                  <img
                    className="imgproductdisable"
                    border="0"
                    alt="Calendar"
                    src="assets/img/icon-qmemento.png"
                  ></img>
                </div>
              </span>
              <span className="productsbutton">
                <div onClick={() => this.onSetSidebarOpenCompliance(true)}> 
                <div>
                  <img
                    className="imgproductdisable"
                    border="0"
                    alt="Calendar"
                    src="assets/img/icon-compliance.png"
                  ></img>
                </div>
              </span>
              <span className="productsbutton">
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
              </span> 
                        <span className="spaceproduct"></span>*/}
            </div>
          </section>
        </Fragment>
      </SidebarCnn>
    );
  }

  render() {
    if (this.state.googleDown) {
      const { showNotification, messageNotification } = this.state;
      const { token } = this.state.lexon;
      const baseUrl = window.URL_MF_GOOGLE.replace("/user", "");

      return (
        <div className='d-flex h-100 align-items-center justify-content-center'>
          <Notification
            initialModalState={showNotification}
            toggleNotification={() => {
              messageNotification === 'El mensaje no está en el servidor'
                ? ((token) ? window.open(`${baseUrl}/access/${token}/?prov=GO0`, "_self") : window.open(`${window.URL_MF_GOOGLE}/GO0${this.props.lexon.userId}`, '_self'))
                : this.onSignoutDisconnect();
            }}
            message={messageNotification}
          />
        </div>
      );
    }
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
      setSearchQuery,
      deleteMessage,
      setGUID: ACTIONS.setGUID,
      setSign: ACTIONS.setSign
    },
    dispatch
  );

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(Main);

function isEmpty(obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false;
    }
  }

  return JSON.stringify(obj) === JSON.stringify({});
}
