import React, { Component, Fragment } from "react";
import { connect } from "react-redux";

import ACTIONS from "./actions/email";
import APPLICATION_ACTIONS from "./actions/applicationAction";
import "./main.css";
import i18n from "i18next";

// import Header from "./components/header/header";
import Routing from "./components/routing/routing";
import Spinner from "./components/spinner/spinner";
import Notification from "./components/notification/notification";
import { getCompanies, getUser } from "./services/services-lexon";

class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
      companies: [],
      isLoading: true,
      showNotification: false,
      messageNotification: null,
      idCaseFile: null,
      bbdd: null,
      idCompany: null
    };

    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleCheckAllclick = this.handleCheckAllclick.bind(this);
    this.handlePutUserFromLexonConnector = this.handlePutUserFromLexonConnector.bind(
      this
    );

    this.toggleNotification = this.toggleNotification.bind(this);
  }

  componentDidMount() {
    window.addEventListener("Checkclick", this.handleKeyPress);
    window.addEventListener("CheckAllclick", this.handleCheckAllclick);
    window.addEventListener(
      "PutUserFromLexonConnector",
      this.handlePutUserFromLexonConnector
    );

    this.sendMessageGetUser();
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
    window.removeEventListener("Checkclick", this.handleKeyPress);
    window.removeEventListener("CheckAllclick", this.handleCheckAllclick);
    window.removeEventListener(
      "PutUserFromLexonConnector",
      this.handlePutUserFromLexonConnector
    );
  }

  handleKeyPress(event) {
    event.detail.chkselected
      ? this.props.addMessage(event.detail.name)
      : this.props.deleteMessage(event.detail.name);
  }

  handleCheckAllclick(event) {
    event.detail.chkselected
      ? this.props.addListMessages(event.detail.listMessages)
      : this.props.deleteListMessages(event.detail.listMessages);
  }

  sendMessageGetUser() {
    window.dispatchEvent(new CustomEvent("GetUserFromLexonConnector"));
  }

  async getCompanies(user) {
    getCompanies(user);
  }

  async handlePutUserFromLexonConnector(event) {
    const { user, selectedMessageId, idCaseFile, bbdd, idCompany } = event.detail;
    if (idCaseFile != null && idCaseFile !== undefined) {
      this.setState({ idCaseFile: idCaseFile, bbdd: bbdd, idCompany: idCompany });
    }

    selectedMessageId.forEach(message => {
      this.props.addMessage(message);
    });

    getUser(user)
      .then(result => {
        this.setState({ user: result.user });
        getCompanies(this.state.user)
          .then(result => {
            this.setState({
              isLoading: false,
              companies: result.companies
            });
            if (Array.isArray(result.errors)) {
              result.errors.forEach(error =>
                this.props.addError(JSON.stringify(error))
              );
            } else {
              this.props.addError(JSON.stringify(result.errors));
            }
          })
          .catch(errors => {
            this.setState({ isLoading: false });
            if (Array.isArray(errors)) {
              errors.forEach(error =>
                this.props.addError(JSON.stringify(error))
              );
            } else {
              this.props.addError(JSON.stringify(errors));
            }
            console.log("errors ->", this.props.errors);
          });
      })
      .catch(errors => {
        this.setState({ isLoading: false });
        if (Array.isArray(errors)) {
          errors.forEach(error => this.props.addError(JSON.stringify(error)));
        } else {
          this.props.addError(JSON.stringify(errors));
        }
        console.log("errors ->", this.props.errors);
      });
  }

  toggleNotification(message) {
    this.setState(state => ({
      showNotification: !state.showNotification,
      messageNotification: message
    }));
  }

  renderErrors() {
    const { errors } = this.props;
    if (errors.length > 0) {
      return (
        <p className="connexion-status connexion-status-ko">
          {i18n.t("main.error_connection")}
          <span className="lf-icon-warning"></span>
        </p>
      );
    }
  }

  render() {
    const {
      isLoading,
      user,
      companies,
      showNotification,
      messageNotification,
      idCaseFile,
      bbdd,
      idCompany
    } = this.state;

    if (isLoading) {
      return <Spinner />;
    }

    return (
      <Fragment>
        {/* <Header title={"LEX-ON"} /> */}
        {this.renderErrors()}
        <Notification
          initialModalState={showNotification}
          toggleNotification={this.toggleNotification}
          message={messageNotification}
        />
        
        <div className="lex-on-configuration">
          <a href="#/" className="lex-on-configuration-trigger">
            <strong className="sr-only sr-only-focusable">
              Opciones de configuración
            </strong>
            <span className="lf-icon-configuration"></span>
          </a>
        </div>

        <Routing
          user={user}
          companies={companies}
          toggleNotification={this.toggleNotification}
          casefile={idCaseFile}
          bbdd={bbdd}
          company={idCompany}
        />
      </Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    selectedMessages: state.email.selectedMessages,
    errors: state.applicationReducer.errors
  };
};

const mapDispatchToProps = dispatch => ({
  addMessage: item => dispatch(ACTIONS.addMessage(item)),
  deleteMessage: id => dispatch(ACTIONS.deleteMessage(id)),
  addListMessages: listMessages =>
    dispatch(ACTIONS.addListMessages(listMessages)),
  deleteListMessages: listMessages =>
    dispatch(ACTIONS.deleteListMessages(listMessages)),
  addError: error => dispatch(APPLICATION_ACTIONS.addError(error))
});

export default connect(mapStateToProps, mapDispatchToProps)(Main);
