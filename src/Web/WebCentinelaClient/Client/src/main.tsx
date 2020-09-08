import React, { Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect, ConnectedProps } from 'react-redux';
import i18n from 'i18next';
import queryString from 'query-string';
import './main.css';
import Routing from './components/routing/routing';
import Spinner from './components/spinner/spinner';
import Notification from './components/notification/notification';
import Progress from './components/progress/progress';
import { MessagesActions } from './store/messages/actions';
import { ApplicationActions } from './store/application/actions';
import { Message } from './store/messages/types';

interface State {
  user: any;
  showNotification: boolean;
  messageNotification: string;
  errorNotification: boolean;
  showProgress:boolean;
  messageProgress:string;
  addonType: any;
  addonData: any;
  isAddon: boolean;
}

const mapStateToProps = (state: any) => {
  const { errors, isLoading } = state.application;
  const { selected } = state.messages;
  return {
    selected: selected,
    errors: errors,
    isLoading: isLoading,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    ...bindActionCreators(
      {
        addMessage: MessagesActions.addMessage,
        deleteMessage: MessagesActions.deleteMessage,
        addListMessages: MessagesActions.addListMessages,
        deleteListMessages: MessagesActions.deleteListMessages,
        resetListMessages: MessagesActions.resetListMessages,
        setLoadingStatus: ApplicationActions.setLoadingStatus,
        setComposerStatus: ApplicationActions.setComposerStatus,
        setCurrentUser: ApplicationActions.setCurrentUser,
      },
      dispatch
    ),
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type ReduxProps = ConnectedProps<typeof connector>;

interface Props extends ReduxProps {}

class Main extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      user: null,
      showNotification: false,
      messageNotification: '',
      errorNotification: false,
      showProgress: false,
      messageProgress: '',
      addonType: null,
      addonData: null,
      isAddon: false
    };

    this.toggleProgress = this.toggleProgress.bind(this);
    this.toggleNotification = this.toggleNotification.bind(this);
    this.handleShowLoader = this.handleShowLoader.bind(this);
    this.handleHideLoader = this.handleHideLoader.bind(this);
    this.handleResetList = this.handleResetList.bind(this);
    this.handleOpenComposer = this.handleOpenComposer.bind(this);
    this.handleCloseComposer = this.handleCloseComposer.bind(this);
    this.handleMessageSelected = this.handleMessageSelected.bind(this);
    this.handlePutUserFromCentinelaConnector = this.handlePutUserFromCentinelaConnector.bind(
      this
    );
    this.handlePutAddonFromCentinelaConnector = this.handlePutAddonFromCentinelaConnector.bind(
      this
    );
    this.handleListMessagesSelected = this.handleListMessagesSelected.bind(
      this
    );
  }

  componentDidMount() {
    window.addEventListener('LoadingMessage', this.handleShowLoader);
    window.addEventListener('LoadedMessage', this.handleHideLoader);
    window.addEventListener('Checkclick', this.handleMessageSelected);
    window.addEventListener('ResetList', this.handleResetList);
    window.addEventListener('CheckAllclick', this.handleListMessagesSelected);
    window.addEventListener('OpenComposer', this.handleOpenComposer);
    window.addEventListener('CloseComposer', this.handleCloseComposer);
    window.addEventListener(
      'PutUserFromCentinelaConnector',
      this.handlePutUserFromCentinelaConnector
    );
    window.addEventListener(
      'PutAddonFromCentinelaConnector',
      this.handlePutAddonFromCentinelaConnector
    );
    this.sendMessageGetUser();
    this.sendMessageGetAddonsInfo();
  }

  componentWillUnmount() {
    window.removeEventListener('LoadingMessage', this.handleShowLoader);
    window.removeEventListener('LoadedMessage', this.handleHideLoader);
    window.removeEventListener('ResetList', this.handleResetList);
    window.removeEventListener('Checkclick', this.handleMessageSelected);
    window.removeEventListener('OpenComposer', this.handleOpenComposer);
    window.removeEventListener('CloseComposer', this.handleCloseComposer);

    window.removeEventListener(
      'CheckAllclick',
      this.handleListMessagesSelected
    );
    window.addEventListener(
      'PutUserFromCentinelaConnector',
      this.handlePutUserFromCentinelaConnector
    );
    window.removeEventListener(
      'PutAddonFromCentinelaConnector',
      this.handlePutAddonFromCentinelaConnector
    );
  }

  handleOpenComposer() {
    console.log('handleOpenComposer');
    this.props.setComposerStatus('open');
  }

  handleCloseComposer() {
    console.log('handleCloseComposer');
    this.props.setComposerStatus('closed');
  }

  // TODO: Check this any type
  async handleResetList(event: any) {
    const { resetListMessages } = this.props;
    this.props.resetListMessages();
  }

  sendMessageGetUser() {
    console.log('Send Message -> Centinela - GetUserFromCentinelaConnector');
    window.dispatchEvent(new CustomEvent('GetUserFromCentinelaConnector'));
  }

  sendMessageGetAddonsInfo() {
    window.dispatchEvent(new CustomEvent('GetAddonsInfoFromCentinelaConnector'));
  }

  // TODO: Check this any type
  async handlePutUserFromCentinelaConnector(event: any) {
    debugger
    console.log(
      'HandleEvent Client -> Centinela - PutUserFromCentinelaConnector'
    );
    console.log(event.detail);

    const { user, selectedMessages, addonType, env } = event.detail;
    (window as any).currentEnv = env;
    if (addonType != null && addonType !== undefined) {
      this.setState({ addonType, addonData: event.detail });
    }
    this.props.setCurrentUser(user);

    selectedMessages.forEach((message: Message) => {
      this.props.addMessage(message);
    });
  }

  handleShowLoader() {
    const { setLoadingStatus } = this.props;
    setLoadingStatus(true);
  }

  handleHideLoader() {
    const { setLoadingStatus } = this.props;
    setLoadingStatus(false);
  }

  // TODO: Check any type
  handleMessageSelected(event: any) {
    const { addMessage, deleteMessage } = this.props;

    event.detail.chkselected
      ? addMessage({
          id: event.detail.extMessageId,
          subject: event.detail.subject,
          folder: event.detail.folder,
          sentDateTime: event.detail.sentDateTime,
          raw: event.detail.raw,
        })
      : deleteMessage(event.detail.extMessageId);
  }

  // TODO: Check any type
  handleListMessagesSelected(event: any) {
    const { addListMessages, deleteListMessages } = this.props;
    event.detail.chkselected
      ? addListMessages(event.detail.listMessages)
      : deleteListMessages(event.detail.listMessages);
  }

  async handlePutAddonFromCentinelaConnector(event: any) {
    debugger
    this.setState({ isAddon: true });
  }

  closeCentinelaConnector(message?: string) {
    if (!message && this.state.isAddon) {
      const values = queryString.parse(window.location.search);
      let redirect_uri = values.redirect_uri
        ? values.redirect_uri
        : (window as any).GOOGLE_SCRIPT_CENTINELA;
      window.location.replace(
        `${redirect_uri}` + '?success=1' + '&state=' + values.state
      );
    }
  }

  toggleNotification(message?: string, error?: boolean) {
    this.closeCentinelaConnector(message);
    this.setState((state) => ({
      showNotification: !state.showNotification,
      messageNotification: message || '',
      errorNotification: error || false,
    }));
  }

  toggleProgress(message?: string) {
    this.closeCentinelaConnector(message);
    this.setState((state) => ({
      showProgress: !state.showProgress,
      messageProgress: message || '',
    }));
  }

  renderErrors() {
    const { errors } = this.props;
    let bbddError = false;
    if (errors.length > 0) {
      for (let i = 0; i < errors.length; i++) {
        if (errors[i].indexOf('"code":"2003"') > -1) {
          bbddError = true;
          break;
        }
      }

      return (
        <p className='connexion-status connexion-status-ko'>
          {bbddError === true
            ? i18n.t('main.bbdd_error')
            : i18n.t('main.error_connection')}
          <span className='lf-icon-warning'></span>
        </p>
      );
    }
  }

  render() {
    const {
      showNotification,
      messageNotification,
      errorNotification,
      showProgress,
      messageProgress,
      addonType,
      addonData
    } = this.state;
    const { errors, isLoading } = this.props;

    return (
      <Fragment>
        {errors && errors.length > 0 && this.renderErrors()}
        <Notification
          initialModalState={showNotification}
          toggleNotification={this.toggleNotification}
          message={messageNotification}
          error={errorNotification}
        />
        <Progress
          initialModalState={showProgress}
          toggleProgress={this.toggleProgress}
          message={messageProgress}
        />
        {isLoading && (
          <div className='spinner-wrapper'>
            <Spinner />
          </div>
        )}
        {errors && errors.length === 0 && (
          <Routing
          toggleNotification={this.toggleNotification}
          toggleProgress={this.toggleProgress}
          addonType={addonType}
          addonData={addonData}
          />
        )}

        <style jsx>{`
          .spinner-wrapper {
            position: absolute;
            top: 65px;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(255, 255, 255, 0.8);
            z-index: 1;
          }
        `}</style>
      </Fragment>
    );
  }
}

export default connector(Main);
