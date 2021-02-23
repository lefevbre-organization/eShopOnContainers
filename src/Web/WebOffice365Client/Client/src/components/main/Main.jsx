import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import * as uuid from 'uuid/v4';
import ACTIONS from '../../actions/lexon';
import CU_ACTIONS from '../../actions/user';
import Cookies from 'js-cookie';
import { detailedDiff } from 'deep-object-diff';
import Header from '../header/Header';
import Sidebar from '../sidebar/Sidebar';
import NotFound from '../not-found/NotFound';
import './main.scss';
import MessageList from '../content/message-list/MessageList';
import MessageContent from '../content/message-list/message-content/MessageContent';
import { Route, Switch, withRouter } from 'react-router-dom';
import { getLabels, getInbox, getSpecialFolder } from '../sidebar/sidebar.actions';
import {
  getLabelMessages,
  emptyLabelMessages,
  toggleSelected,
  setPageTokens,
  addInitialPageToken,
  clearPageTokens,
  setSearchQuery,
  deleteMessage,
} from '../content/message-list/actions/message-list.actions';
import { selectLabel } from '../sidebar/sidebar.actions';
import { signOut } from '../../api_graph/authentication';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import i18n from 'i18next';

import e from '../../event-bus';
import SidebarCnn from 'react-sidebar';
import LexonComponent from '../../apps/lexon_content';
import CentinelaComponent from '../../apps/centinela_content';
import DatabaseComponent from '../../apps/database_content';
import SidebarComponent from '../../apps/sidebar_content';
import ComposeMessage from '../compose-message/ComposeMessage';
import 'react-reflex/styles.css';
import {
  addOrUpdateAccount,
  resetDefaultAccount,
  getUser,
} from '../../api_graph/accounts';
import { PROVIDER } from '../../constants';
import MessageNotFound from '../message-not-found/MessageNotFound';
import CalendarComponent from '../../apps/calendar_content';
import {addContact, getContacts} from '../../api_graph';
import { TooltipComponent } from "@syncfusion/ej2-react-popups";

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
    this.loadLabelMessageSingle = this.loadLabelMessageSingle.bind(this);

    this.state = {
      isVisible: true,
      fluid: true,
      customAnimation: false,
      slow: false,
      size: 0.25,
      sidebarOpen: false,
      sidebarDocked: false,
      sidebarComponent: (
        <img border='0' alt='Lefebvre' src='/assets/img/lexon-fake.png'></img>
      ),
      leftSideBar: {
        collapsed: false,
      },
      loadFolders: false,
      retry: false,
      showMessageNotFound: false,
    };

    e.on('message', function (data) {
      alert('got ' + data.text);
      e.emit('received', { text: 'Woohoo! Hello from Multi-channel app!' });
    });

    this.onSetSidebarDocked = this.onSetSidebarDocked.bind(this);
    this.onSetSidebarOpenLexon = this.onSetSidebarOpenLexon.bind(this);
    this.onSetSidebarOpenQMemento = this.onSetSidebarOpenQMemento.bind(this);
    this.onSetSidebarOpenCalendar = this.onSetSidebarOpenCalendar.bind(this);
    this.onSetSidebarOpenCompliance = this.onSetSidebarOpenCompliance.bind(
      this
    );
    this.onSetSidebarOpenDatabase = this.onSetSidebarOpenDatabase.bind(this);
    this.handleGetUserFromLexonConnector = this.handleGetUserFromLexonConnector.bind(
      this
    );
    this.handleGetUserFromCentinelaConnector = this.handleGetUserFromCentinelaConnector.bind(
      this
    );

    this.changeLexonBBDD = this.changeLexonBBDD.bind(this);
    this.toggleSideBar = this.toggleSideBar.bind(this);
    this.toggleShowMessageNotFound = this.toggleShowMessageNotFound.bind(this);
    this.uploadContact = this.uploadContact.bind(this);
    this.getContactList = this.getContactList.bind(this);

    this.notFoundModal = props.notFoundModal;
  }

  toggleShowMessageNotFound() {
    this.setState((state) => ({
      showMessageNotFound: !state.showMessageNotFound,
    }));
  }

  toggleSideBar() {
    const toggleCollapsed = !this.state.leftSideBar.collapsed;
    this.setState({
      leftSideBar: {
        collapsed: toggleCollapsed,
      },
    });
  }

  sendMessagePutUser(user) {
    const { selectedMessages } = this.props;

    window.dispatchEvent(
      new CustomEvent('PutUserFromLexonConnector', {
        detail: {
          user,
          selectedMessages: selectedMessages.map((itm) => ({
            ...itm,
            id: itm.internetId,
          })),
          idCaseFile: this.props.lexon.idCaseFile,
          bbdd: this.props.lexon.bbdd,
          idCompany: this.props.lexon.idCompany,
          provider: 'OU',
          account: this.props.User.email,
          env: window.currentUser?window.currentUser.env:null
        },
      })
    );
  }

  handleGetUserFromLexonConnector() {
    const { userId } = this.props.lexon;

    if (userId) {
      this.sendMessagePutUser(userId);
    }
  }

  handleGetUserFromCentinelaConnector() {
    const { userId } = this.props.lexon;

    if (userId) {
      this.sendMessageCentinelaPutUser(userId);
    }
  }

  sendMessageCentinelaPutUser(user) {
    const { selectedMessages } = this.props;
    window.dispatchEvent(
      new CustomEvent('PutUserFromCentinelaConnector', {
        detail: {
          user,
          selectedMessages: selectedMessages.map((m) => ({
            ...m,
            id: m.extMessageId,
          })),
          provider: this.props.lexon.provider,
          account: this.props.User.email,
          env: window.currentUser?window.currentUser.env:null
        },
      })
    );
  }

  async uploadContact(data) {
    await addContact(data.detail.contact);
    window.dispatchEvent(
      new CustomEvent('contactUploaded', {
        detail: { contact: data.detail.contact },
      })
    );
  }

  async getContactList() {
    let contacts = [];

    const aux = await getContacts();
    contacts = [...aux];

    window.dispatchEvent(
      new CustomEvent('getContactListResult', { detail: { contacts } })
    );
  }

  onSetSidebarOpenLexon(open) {
    this.setState({
      sidebarComponent: (
        <LexonComponent sidebarDocked={this.onSetSidebarDocked} />
      ),
    });
    this.setState({ sidebarDocked: open }, ()=>{
      this.forceUpdate();
    });
  }

  onSetSidebarOpenCalendar(open) {
    this.setState({
      sidebarComponent: (
        <CalendarComponent sidebarDocked={this.onSetSidebarDocked} />
      ),
    });
    this.setState({ sidebarDocked: open }, ()=>{
      this.forceUpdate();
    });
  }

  onSetSidebarOpenQMemento(open) {
    let lexon = (
      <img
        border='0'
        alt='Lefebvre'
        src='/assets/img/lexon-fake-null.png'></img>
    );
    this.setState({ sidebarComponent: lexon, sidebarDocked: open }, ()=>{
      this.forceUpdate();
    });
  }

  onSetSidebarOpenCentinela(open) {
    this.setState({
      sidebarComponent: (
        <CentinelaComponent sidebarDocked={this.onSetSidebarDocked} />
      ),
    });
    this.setState({ sidebarDocked: open }, ()=>{
      this.forceUpdate();
    });
  }

  onSetSidebarOpenCompliance(open) {
    let lexon = (
      <img
        border='0'
        alt='Lefebvre'
        src='/assets/img/lexon-fake-null.png'></img>
    );
    this.setState({ sidebarComponent: lexon, sidebarDocked: open }, ()=>{
      this.forceUpdate();
    });
  }

  onSetSidebarOpenDatabase(open) {
    this.setState({
      sidebarComponent: (
        <DatabaseComponent sidebarDocked={this.onSetSidebarDocked} />
      ),
    });
    this.setState({ sidebarDocked: open }, ()=>{
      this.forceUpdate();
    });
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

    if (nextProps.messagesResult.openMessage === ''){
      return true;
    }

    if (
      nextProps.messagesResult.openMessage &&
      nextProps.messagesResult.openMessage !== null &&
      nextProps.messagesResult.openMessage !== "" &&
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

    if (nextProps.messagesResult.openMessage !== this.props.messagesResult.openMessage){ // to prevent component MessageContent from mounting twice when opening a msg
      return false
    }

    return true;
  }

  changeLexonBBDD(event) {
    this.props.setBBDD(event.detail.bbdd);
  }

  loadSpecialFolders() {
    const specialFolders= ['inbox', 'deleteditems', 'drafts', 'junkemail', 'outbox', 'sentitems'];
    const it = setInterval(()=>{
      if(specialFolders.length === 0) {
        clearInterval(it);
        return;
      }

      const f = specialFolders.pop();
      this.props.getSpecialFolder(f);
      }, 200);
  }

  async componentDidMount() {
    this.getLabelList();
    this.loadSpecialFolders();
    this.getLabelInbox();

    window.addEventListener('ChangedLexonBBDD', this.changeLexonBBDD);
    window.addEventListener(
      'GetUserFromLexonConnector',
      this.handleGetUserFromLexonConnector
    );
    window.addEventListener(
      'GetUserFromCentinelaConnector',
      this.handleGetUserFromCentinelaConnector
    );
    window.addEventListener('RemoveSelectedDocument', (event) => {
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
            provider: 'OUTLOOK',
            account: this.props.lexon.account,
            chkselected: false,
          },
        })
      );
    });

    const { userId, idCaseFile, bbdd, mailContacts } = this.props.lexon;
    const { email } = this.props.User;
    const idEmail = this.props.idEmail;
    if (userId !== null && email !== null) {
      const user = await getUser(userId);

      let sign = '';
      const account = user.data.accounts.filter((a) => a.email === email);
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
        mails: [],
      };
      addOrUpdateAccount(userId, newAccount)
        .then((result) => {
          Cookies.set(`Lefebvre.DefaultAccount.${userId}`, GUID, {
            domain: 'lefebvre.es',
          });
          this.props.setGUID(GUID);
          this.props.setSign(sign);

          if (
            idEmail != null &&
            idEmail !== undefined &&
            idEmail !== 'notFound'
          ) {
            if (
              (idCaseFile != null && idCaseFile != undefined) ||
              (bbdd !== null) & (bbdd !== undefined)
            ) {
              this.onSetSidebarOpenLexon(true);
            }

            this.props.history.push(`/${idEmail}`);
          } else if (idCaseFile !== null && idCaseFile !== undefined) {
            this.props.history.push('/compose');
            this.onSetSidebarOpenLexon(true);
          } else if (mailContacts !== null) {
            this.props.history.push('/compose');
            this.onSetSidebarOpenLexon(true);
          } else if ((bbdd !== null) & (bbdd !== undefined)) {
            this.onSetSidebarOpenLexon(true);
          } else {
            // // if (idEmail === "notFound") {
            // //   this.toggleShowMessageNotFound(true);
            // // }
            // // else if (this.state.showMessageNotFound === false){
            // //   this.props.history.push("/inbox");
            // // }
            // // else {
            //   this.props.history.push("/inbox");
            // // }
            if (idEmail === 'notFound') {
              this.toggleShowMessageNotFound(true);
              this.setState({ selectFolder: this.getLabelInbox() });
            }
          }
        })
        .catch((error) => {
          console.error('error ->', error);
        });
    }

    window.addEventListener('uploadContact', this.uploadContact);
    window.addEventListener('getContactList', this.getContactList);
  }

  componentWillUnmount() {
    window.removeEventListener(
      'GetUserFromLexonConnector',
      this.handleGetUserFromLexonConnector
    );
    window.removeEventListener(
      'GetUserFromCentinelaConnector',
      this.handleGetUserFromCentinelaConnector
    );
    window.removeEventListener('ChangedLexonBBDD', this.changeLexonBBDD);
    window.removeEventListener('uploadContact', this.uploadContact);
    window.removeEventListener('getContactList', this.getContactList);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.User !== this.props.User) {
      this.setState({
        signedInUser: this.props.User,
      });
    }

    if (this.state.showMessageNotFound === true && this.notFoundModal === 0) {
      this.notFoundModal = 1;
    } else if (
      this.state.showMessageNotFound === false &&
      this.notFoundModal === 1
    ) {
      var labelInbox = this.props.labelsResult.labels.find((label) => {
        if (label.displayName === 'Inbox') {
          return label;
        }
      });

      this.setState({ selectFolder: labelInbox.id });
      this.loadLabelMessages(labelInbox);
      this.notFoundModal = 2;
    } else {
      const { labels } = this.props.labelsResult;
      const { pathname } = this.props.location;
      var selectedLabel = labels.find((el) => el.selected);
      var labelPathMatch = labels.find(
        (el) => el.id.toLowerCase() === pathname.slice(1)
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

      if (
        !this.state.loadFolders &&
        prevProps.labelsResult.labels !== this.props.labelsResult.labels
      ) {
        this.setState({ loadFolders: true });
        if (
          this.props.labelsResult &&
          this.props.labelsResult.labels.length > 0 &&
          (this.props.lexon.idCaseFile == null ||
            this.props.lexon.idCaseFile === undefined)
        ) {
          if (
            this.props.labelsResult.labelInbox !== null &&
            this.props.labelsResult.labelInbox !== undefined
          ) {
            this.loadLabelMessages(this.props.labelsResult.labelInbox);
            this.setState({ retry: false });
          } else {
            this.setState({ retry: true });
          }
        }
      }

      console.log('(0) this.props.labelsResult ->', this.props.labelsResult);
      console.log('(0) this.state.retry ->', this.state.retry);
      if (
        this.state.retry &&
        this.props.labelsResult.labelInbox !== null &&
        this.props.labelsResult.labelInbox !== undefined
      ) {
        console.log('(1) this.props.labelsResult ->', this.props.labelsResult);
        this.setState({ retry: false });
        this.loadLabelMessages(this.props.labelsResult.labelInbox);
      }
    }
  }

  refreshLabels() {
    this.getLabelList();
    this.renderLabelRoutes();
    // const { labels } = this.props.labelsResult;
    // const selectedLabel = labels.find(el => el.selected);
    // this.getLabelMessages({ labelIds: [selectedLabel.id] });
  }

  loadLabelMessageSingle() {
    this.getLabelList();
    this.renderLabelRoutes();
    const { labels } = this.props.labelsResult;
    const selectedLabel = labels.find((el) => el.selected);
    if (selectedLabel) {
      this.getLabelMessages({ labelIds: [selectedLabel.id] });
    }
  }

  navigateToNextPage(token) {
    const searchParam = this.props.location.search;
    const currentToken =
      searchParam.indexOf('?') === 0 ? searchParam.slice(1) : '';
    this.props.setPageTokens({
      prevPageToken: currentToken,
    });
    this.props.history.push(token);
  }

  navigateToPrevPage(token) {
    this.props.history.push(token);
  }

  loadLabelMessages(label) {
    const { mailContacts } = this.props.lexon;
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

  getLabelInbox() {
    if (this.props.idEmail === undefined) {
      // this.props.getInbox();
      this.props.getSpecialFolder('inbox');
    }
  }

  getLabelMessages(labelIds, q, pageToken) {
    this.props.emptyLabelMessages();
    this.props.getLabelMessages(labelIds, q, pageToken);
  }

  addInitialPageToken(token) {
    this.props.addInitialPageToken(token);
  }

  hasProduct(product) {
    if (this.props.currentUser && this.props.currentUser.roles) {
      return this.props.currentUser.roles.indexOf(product) > -1
    }

    return false;
  }

  renderLabelRoutes() {
    const { leftSideBar } = this.state;
    return this.props.labelsResult.labels.map((el) => (
      <Route
        key={el.id + '_route'}
        exact
        path={'/' + el.id}
        render={(props) => {
          const that = this;
          return (
            <MessageList
              {...props}
              microsoftUser={this.props.User}
              sideBarCollapsed={leftSideBar.collapsed}
              sideBarToggle={this.toggleSideBar}
              getLabelMessages={this.getLabelMessages}
              messagesResult={this.props.messagesResult}
              toggleSelected={this.props.toggleSelected}
              navigateToNextPage={this.navigateToNextPage}
              navigateToPrevPage={this.navigateToPrevPage}
              pageTokens={this.props.pageTokens}
              addInitialPageToken={this.addInitialPageToken}
              totalmessages={el.totalItemCount}
              refresh={() => {
                this.refreshLabels();
              }}
              parentLabel={that.props.labelsResult.labels.find(
                (el) => el.id === props.match.path.slice(1)
              )}
              searchQuery={this.props.searchQuery}
              setSearchQuery={this.props.setSearchQuery}
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
    const { userId, token } = this.props.lexon;
    if (userId !== null) {
      resetDefaultAccount(userId).then((result) => {
        console.log(result);

        const urlRedirect = token
          ? `${window.URL_SELECT_ACCOUNT}/access/${token}/`
          : `${window.URL_SELECT_ACCOUNT}/user/${userId}/encrypt/0`;
        signOut(urlRedirect);
      });
    }
  }

  renderInboxViewport() {
    const { leftSideBar, showMessageNotFound } = this.state;
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
            background: 'white',
            zIndex: 100,
            overflowY: 'hidden',
            WebkitTransition: '-webkit-transform 0s',
            willChange: 'transform',
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
            transition: 'left .0s ease-out, right .0s ease-out',
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
            backgroundColor: 'rgba(0,0,0,.3)',
          },
          dragHandle: {
            zIndex: 1,
            position: 'fixed',
            top: 0,
            bottom: 0,
          },
        }}>
        <MessageNotFound
          initialModalState={showMessageNotFound}
          toggleShowMessageNotFound={this.toggleShowMessageNotFound}
        />
        <Fragment>
          <Header
            microsoftUser={this.props.User}
            onSignout={this.onSignout}
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
              selectedLabel={this.props.labelsResult.labelInbox}
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
                      bbdd={lexon.bbdd}
                      mailContacts={lexon.mailContacts}
                      loadLabelMessages={this.loadLabelMessages}
                      labelsResult={this.props.labelsResult}
                    />
                  )}
                />
                <Route exact path='/notfound' component={NotFound} />
                <Route
                  exact
                  path='/:id([a-zA-Z0-9!@#$%^&+=_-]+)'
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
                <Route
                  exact
                  path='/compose/:id([a-zA-Z0-9!@#$%^&+=_-]+)'
                  component={() => (
                    <ComposeMessage
                    history={this.props.history}
                    sideBarCollapsed={leftSideBar.collapsed}
                    sideBarToggle={this.toggleSideBar}
                    casefile={lexon.idCaseFile}
                    bbdd={lexon.bbdd}
                    mailContacts={lexon.mailContacts}
                    loadLabelMessages={this.loadLabelMessages}
                    labelsResult={this.props.labelsResult}
                  />
                  )}
                />
              </Switch>
            </article>

            <div className='productpanel'>
              {window.SHOW_EXPERIMENTAL === '1' && (
                <span className='productsbutton'>
                  <TooltipComponent content={i18n.t('tooltips.calendar')}>
                    <div onClick={() => this.onSetSidebarOpenCalendar(true)}>
                      <img
                        className='imgproduct'
                        border='0'
                        alt='Calendar'
                        src='/assets/img/icon-cal.svg'></img>
                    </div>
                  </TooltipComponent>
                </span>
              )}
              <span className='productsbutton'>
                {lexon.user  ? (
                  <TooltipComponent content={i18n.t('tooltips.lexon')}>
                    <div onClick={() => this.onSetSidebarOpenLexon(true)}>
                    <img
                      className='imgproduct'
                      border='0'
                      alt='Lex-On'
                      src='/assets/img/icon-lx.svg'></img>
                    </div>
                  </TooltipComponent>
                ) : (
                  <div>
                    <img
                      className='imgproductdisable'
                      border='0'
                      alt='Lex-On'
                      src='/assets/img/icon-lx.svg'></img>
                  </div>
                )}
              </span>
              {this.hasProduct('centinelaconnector') && (
                  <span className='productsbutton'>
                    <TooltipComponent content={i18n.t('tooltips.centinela')}>
                      <div onClick={() => this.onSetSidebarOpenCentinela(true)}>
                        <img
                          className='imgproduct'
                          border='0'
                          alt='Centinela'
                          src='/assets/img/icon-cn.svg'></img>
                      </div>
                    </TooltipComponent>
                  </span>
                )}
              {this.hasProduct('databaseconnector') &&
                window.SHOW_EXPERIMENTAL === '1' && (
                  <span className='productsbutton'>
                    <TooltipComponent content={i18n.t('tooltips.database')}>
                      <div onClick={() => this.onSetSidebarOpenDatabase(true)}>
                        <img
                          className='imgproduct'
                          border='0'
                          alt='Base de datos'
                          src='/assets/img/icon-ne.svg'></img>
                      </div>
                    </TooltipComponent>
                  </span>
                )}
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

const mapStateToProps = (state) => ({
  labelsResult: state.labelsResult,
  messagesResult: state.messagesResult,
  pageTokens: state.pageTokens,
  searchQuery: state.searchQuery,
  lexon: state.lexon,
  currentUser: state.currentUser,
  selectedMessages: state.messageList.selectedMessages,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      getLabels,
      getInbox,
      getSpecialFolder,
      getLabelMessages,
      emptyLabelMessages,
      toggleSelected,
      selectLabel,
      setPageTokens,
      addInitialPageToken,
      clearPageTokens,
      setSearchQuery,
      deleteMessage,
      setBBDD: ACTIONS.setBBDD,
      setGUID: ACTIONS.setGUID,
      setSign: ACTIONS.setSign,
      setCurrentUser: CU_ACTIONS.setCurrentUser
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