import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import ACTIONS from "./actions/email";
import "./main.css";

// import Header from "./components/header/header";
import Routing from "./components/routing/routing";
import Spinner from "./components/spinner/spinner";
import Notification from "./components/notification/notification";
import i18n from "i18next";

import { getCompanies } from "./services/services-lexon";

class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
      companies: [],
      isLoading: true,
      showNotification: false,
      messageNotification: null,
      error: ""
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
    const { user, selectedMessageId } = event.detail;
    selectedMessageId.forEach(message => {
      this.props.addMessage(message);
    });

    getCompanies(user)
      .then(result => {
        this.setState({
          isLoading: false,
          user: user,
          companies: result.companies
        });
      })
      .catch(error => {
        console.log("error ->", error);
        this.setState({ error: error, isLoading: false });
      });
  }

  toggleNotification(message) {
    this.setState(state => ({
      showNotification: !state.showNotification,
      messageNotification: message
    }));
  }

  render() {
    const {
      isLoading,
      user,
      companies,
      showNotification,
      messageNotification,
      error
    } = this.state;

    if (isLoading) {
      return <Spinner />;
    }

    if (!isLoading && error !== "") {
      return (
        <div className="d-flex w-100 h-100 flex-column justify-content-center align-items-center vertical-center">
          <div className="h1">{i18n.t("main.error_connection")}</div>
          <div>[{error}]</div>
        </div>
      );
    }

    return (
      <Fragment>
        {/* <Header title={"LEX-ON"} /> */}
        <Notification
          initialModalState={showNotification}
          toggleNotification={this.toggleNotification}
          message={messageNotification}
        />
        <Routing
          user={user}
          companies={companies}
          toggleNotification={this.toggleNotification}
        />
      </Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    selectedMessages: state.email.selectedMessages
  };
};

const mapDispatchToProps = dispatch => ({
  addMessage: item => dispatch(ACTIONS.addMessage(item)),
  deleteMessage: id => dispatch(ACTIONS.deleteMessage(id)),
  addListMessages: listMessages =>
    dispatch(ACTIONS.addListMessages(listMessages)),
  deleteListMessages: listMessages =>
    dispatch(ACTIONS.deleteListMessages(listMessages))
});

export default connect(mapStateToProps, mapDispatchToProps)(Main);
