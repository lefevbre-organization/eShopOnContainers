import React, { Component, Fragment } from "react";
import { connect } from "react-redux";

import ACTIONS from "./actions/email";
import "./main.css";

// import Header from "./components/header/header";
import Routing from "./components/routing/routing";
import Spinner from "./components/spinner/spinner";
import ClassifyEmails from "./components/classify-emails/classify-emails";

import { getCompanies } from "./services/services-lexon";

class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
      companies: [],
      isLoading: true,
      showClassifyEmails: false
    };

    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleCheckAllclick = this.handleCheckAllclick.bind(this);
    this.handleGetUserFromLexonConnector = this.handleGetUserFromLexonConnector.bind(
      this
    );
    this.handlePutUserFromLexonConnector = this.handlePutUserFromLexonConnector.bind(
      this
    );
    this.toggleClassifyEmails = this.toggleClassifyEmails.bind(this);
  }

  componentDidMount() {
    window.addEventListener("Checkclick", this.handleKeyPress);
    window.addEventListener("CheckAllclick", this.handleCheckAllclick);
    window.addEventListener(
      "GetUserFromLexonConnector",
      this.handleGetUserFromLexonConnector
    );
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
      "GetUserFromLexonConnector",
      this.handleGetUserFromLexonConnector
    );
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

  async getCompanies(user) {
    getCompanies(user);
  }

  sendMessageGetUser() {
    window.dispatchEvent(new CustomEvent("GetUserFromLexonConnector"));
  }

  sendMessagePutUser(user) {
    window.dispatchEvent(
      new CustomEvent("PutUserFromLexonConnector", {
        detail: {
          user
        }
      })
    );
  }

  handleGetUserFromLexonConnector(event) {
    this.sendMessagePutUser("1255717");
  }

  async handlePutUserFromLexonConnector(event) {
    const user = event.detail.user;
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
      });
  }

  toggleClassifyEmails(remove, email) {
    this.setState(state => ({
      showClassifyEmails: !state.showClassifyEmails
    }));
  }

  render() {
    const { isLoading, user, companies, showClassifyEmails } = this.state;

    if (isLoading) {
      return <Spinner />;
    }

    return (
      <Fragment>
        <ClassifyEmails
          initialModalState={showClassifyEmails}
          toggleClassifyEmails={this.toggleClassifyEmails}
        />
        {/* <Header title={"LEX-ON"} /> */}
        <Routing user={user} companies={companies} toggleClassifyEmails={this.toggleClassifyEmails} />
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Main);
