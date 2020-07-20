import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import queryString from 'query-string';
import ACTIONS from './actions/email';
import APPLICATION_ACTIONS from './actions/applicationAction';
import SELECTION_ACTIONS from './actions/selections';
import './main.css';
import i18n from 'i18next';
// import Header from "./components/header/header";
import Routing from './components/routing/routing';
import Spinner from './components/spinner/spinner';
import Notification from './components/notification/notification';
import {
  getCompanies,
  getUser,
  addClassification,
} from './services/services-lexon';

class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      addonData: null,
      user: null,
      companies: [],
      isLoading: true,
      showNotification: false,
      messageNotification: null,
      errorNotification: false,
      idCaseFile: null,
      bbdd: null,
      idCompany: null,
      provider: null,
      account: null,
      isAddon: false,
    };

    this.handleSentMessage = this.handleSentMessage.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleCheckAllclick = this.handleCheckAllclick.bind(this);
    this.handleResetList = this.handleResetList.bind(this);
    this.handlePutUserFromLexonConnector = this.handlePutUserFromLexonConnector.bind(
      this
    );
    this.handlePutAddonFromLexonConnector = this.handlePutAddonFromLexonConnector.bind(
      this
    );
    this.toggleNotification = this.toggleNotification.bind(this);
    this.handleOpenComposer = this.handleOpenComposer.bind(this);
    this.handleCloseComposer = this.handleCloseComposer.bind(this);

    this.onShowLoader = this.onShowLoader.bind(this);
    this.onHideLoader = this.onHideLoader.bind(this);
  }

  componentDidMount() {
    window.addEventListener('Checkclick', this.handleKeyPress);
    window.addEventListener('CheckAllclick', this.handleCheckAllclick);
    window.addEventListener('SentMessage', this.handleSentMessage);
    window.addEventListener('ResetList', this.handleResetList);
    window.addEventListener(
      'PutUserFromLexonConnector',
      this.handlePutUserFromLexonConnector
    );
    window.addEventListener(
      'PutAddonFromLexonConnector',
      this.handlePutAddonFromLexonConnector
    );
    window.addEventListener('OpenComposer', this.handleOpenComposer);
    window.addEventListener('CloseComposer', this.handleCloseComposer);
    window.addEventListener('LoadingMessage', this.onShowLoader);
    window.addEventListener('LoadedMessage', this.onHideLoader);

    this.sendMessageGetUser();
    this.sendMessageGetAddonsInfo();
  }

  // componentDidUpdate(prevProps) {
  //   // if (prevProps.hasError !== this.props.hasError) {
  //   //   this.setState( { showError: this.props.hasError });
  //   // }

  //   if (prevProps.errors !== this.props.errors) {
  //     const hasError = this.props.errors.length > 0 ? true : false;
  //     this.setState({ showError: hasError });
  //   }
  // }

  componentWillUnmount() {
    window.removeEventListener('LoadingMessage', this.onShowLoader);
    window.removeEventListener('LoadedMessage', this.onHideLoader);

    window.removeEventListener('SentMessage', this.handleSentMessage);
    window.removeEventListener('Checkclick', this.handleKeyPress);
    window.removeEventListener('CheckAllclick', this.handleCheckAllclick);
    window.removeEventListener('ResetList', this.handleResetList);
    window.removeEventListener(
      'PutUserFromLexonConnector',
      this.handlePutUserFromLexonConnector
    );
    window.removeEventListener(
      'GoBacPutAddonFromLexonConnectorkAddon',
      this.handlePutAddonFromLexonConnector
    );
    window.removeEventListener('OpenComposer', this.handleOpenComposer);
    window.removeEventListener('CloseComposer', this.handleCloseComposer);
  }

  handleOpenComposer() {
    this.props.setComposerOpen(true);
  }

  handleCloseComposer() {
    this.props.setComposerOpen(false);
  }

  onShowLoader() {
    console.log('ShowSpinner');
    this.props.setShowSpinner(true);
  }

  onHideLoader() {
    console.log('HideSpinner');
    this.props.setShowSpinner(false);
  }

  async handleResetList(event) {
    this.props.resetListMessages();
  }

  // async handleSentMessage(event) {
  //   const { user, idCaseFile, bbdd } = this.state;
  //   const { idEmail, subject, date } = event.detail;

  //   await addClassification(
  //     user,
  //     { bbdd },
  //     [
  //       {
  //         id: idEmail,
  //         subject,
  //         sentDateTime: date
  //       }
  //     ],
  //     idCaseFile,
  //     1
  //   );

  //   window.dispatchEvent(new CustomEvent('RemoveCaseFile'));
  //   // this.props.setCaseFile({
  //   //   casefile: null,
  //   //   bbdd: null,
  //   //   company: null
  //   // });
  // }

  async handleSentMessage(event) {
    const { user, idCaseFile, bbdd } = this.state;
    const { idEmail, subject, date, folder } = event.detail;

    await addClassification(
      user,
      { bbdd },
      [
        {
          id: idEmail,
          subject,
          folder,
          sentDateTime: date,
        },
      ],
      idCaseFile,
      1
    );

    window.dispatchEvent(new CustomEvent('RemoveCaseFile'));
    this.props.setCaseFile({
      casefile: null,
      bbdd: null,
      company: null,
    });
  }

  handleKeyPress(event) {
    console.log('HandleEvent Client -> Lexon - Checkclick');

    event.detail.chkselected
      ? this.props.addMessage({
          id: event.detail.extMessageId,
          //extMessageId: event.detail.extMessageId,
          subject: event.detail.subject,
          folder: event.detail.folder,
          sentDateTime: event.detail.sentDateTime,
          raw: event.detail.raw,
        })
      : this.props.deleteMessage(event.detail.extMessageId);
  }

  handleCheckAllclick(event) {
    console.log('HandleEvent Client -> Lexon - CheckAllclick');

    event.detail.chkselected
      ? this.props.addListMessages(event.detail.listMessages)
      : this.props.deleteListMessages(event.detail.listMessages);
  }

  sendMessageGetUser() {
    window.dispatchEvent(new CustomEvent('GetUserFromLexonConnector'));
  }

  sendMessageGetAddonsInfo() {
    window.dispatchEvent(new CustomEvent('GetAddonsInfoFromLexonConnector'));
  }

  async getCompanies(user) {
    getCompanies(user);
  }

  getAddonData() {
    if (window.addonData) {
      const addonData = window.addonData;
      this.setState({
        addonData: addonData,
        bbdd: {
          idCompany: addonData.idCompany,
          bbdd: addonData.bbdd,
        },
      });
    }
  }

  async handlePutUserFromLexonConnector(event) {
    console.log('HandleEvent Client -> Lexon - PutUserFromLexonConnector');
    this.getAddonData();
    const {
      user,
      selectedMessages,
      idCaseFile,
      bbdd,
      idCompany,
      provider = 'DEFAULT',
      account = 'default@default.def',
    } = event.detail;
    if (idCaseFile != null && idCaseFile !== undefined) {
      this.setState({
        idCaseFile,
        bbdd,
        idCompany,
        provider,
        account,
      });
    }

    if (bbdd && bbdd !== '') {
      this.setState(
        {
          bbdd,
        },
        () => {
          this.props.setInitialBBDD(bbdd);
          window.dispatchEvent(
            new CustomEvent('ChangedLexonBBDD', {
              detail: { bbdd },
            })
          );
        }
      );
    }

    selectedMessages.forEach((message) => {
      this.props.addMessage(message);
    });

    getUser(user)
      .then((result) => {
        const newUser = Object.assign({}, result.user, {
          account,
          provider,
          config: result.config,
        });
        this.setState({ user: newUser });
        this.props.setUser(newUser.idUser);

        getCompanies(newUser)
          .then((result) => {
            if (Array.isArray(result.errors)) {
              result.errors.forEach((error) =>
                this.props.addError(JSON.stringify(error))
              );
            } else {
              this.props.addError(JSON.stringify(result.errors));
            }

            this.setState({
              isLoading: false,
              companies: result.companies || [],
            });
            if (Array.isArray(result.errors)) {
              result.errors.forEach((error) =>
                this.props.addError(JSON.stringify(error))
              );
            } else {
              this.props.addError(JSON.stringify(result.errors));
            }
          })
          .catch((errors) => {
            this.setState({ isLoading: false });
            if (Array.isArray(errors)) {
              errors.forEach((error) =>
                this.props.addError(JSON.stringify(error))
              );
            } else {
              this.props.addError(JSON.stringify(errors));
            }
            console.log('errors ->', this.props.errors);
          });
      })
      .catch((errors) => {
        this.setState({ isLoading: false });
        if (Array.isArray(errors)) {
          errors.forEach((error) => this.props.addError(JSON.stringify(error)));
        } else {
          this.props.addError(JSON.stringify(errors));
        }
        console.log('errors ->', this.props.errors);
      });
  }

  async handlePutAddonFromLexonConnector(event) {
    this.setState({ isAddon: true });
  }

  closeLexonConnector(message) {
    if (!message && this.state.isAddon) {
      const values = queryString.parse(window.location.search);
      let redirect_uri = values.redirect_uri
        ? values.redirect_uri
        : window.GOOGLE_SCRIPT;
      window.location.replace(
        `${redirect_uri}` + '?success=1' + '&state=' + values.state
      );
      localStorage.removeItem('oldTime');
    }
  }

  toggleNotification(message, error = false) {
    this.closeLexonConnector(message);
    this.setState((state) => ({
      showNotification: !state.showNotification,
      messageNotification: message,
      errorNotification: error,
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
      addonData,
      isLoading,
      user,
      companies,
      showNotification,
      messageNotification,
      errorNotification,
      idCaseFile,
      bbdd,
      idCompany,
    } = this.state;
    const { errors } = this.props;

    if (isLoading) {
      return <Spinner />;
    }

    console.log('Rendering initial DDBB: ' + bbdd);

    return (
      <section>
        <Fragment>
          {/* <Header title={"LEX-ON"} /> */}
          {errors && errors.length > 0 && this.renderErrors()}
          <Notification
            initialModalState={showNotification}
            toggleNotification={this.toggleNotification}
            message={messageNotification}
            error={errorNotification}
          />

          {errors && errors.length === 0 && (
            <Routing
              addonData={addonData}
              user={user}
              companies={companies}
              toggleNotification={this.toggleNotification}
              casefile={idCaseFile}
              bbdd={bbdd}
              company={idCompany}
            />
          )}
        </Fragment>
        <style jsx global>{`
          .container {
            max-width: unset;
          }
          
          .imgproduct {
            width: 24px;
            height: 24px;
            cursor: pointer;
          }
        `}</style>
      </section>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    selectedMessages: state.email.selectedMessages,
    errors: state.applicationReducer.errors,
  };
};

const mapDispatchToProps = (dispatch) => ({
  setInitialBBDD: (item) => dispatch(SELECTION_ACTIONS.setInitialBBDD(item)),
  setUser: (item) => dispatch(SELECTION_ACTIONS.setUser(item)),
  addMessage: (item) => dispatch(ACTIONS.addMessage(item)),
  deleteMessage: (id) => dispatch(ACTIONS.deleteMessage(id)),
  addListMessages: (listMessages) =>
    dispatch(ACTIONS.addListMessages(listMessages)),
  deleteListMessages: (listMessages) =>
    dispatch(ACTIONS.deleteListMessages(listMessages)),
  resetListMessages: () => dispatch(ACTIONS.resetListMessages()),
  addError: (error) => dispatch(APPLICATION_ACTIONS.addError(error)),
  setComposerOpen: (open) =>
    dispatch(APPLICATION_ACTIONS.setComposerOpen(open)),
  setShowSpinner: (show) => dispatch(APPLICATION_ACTIONS.setShowSpinner(show)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Main);
