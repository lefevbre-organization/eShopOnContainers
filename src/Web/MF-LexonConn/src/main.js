import React, { Component, Fragment } from "react";
import { connect } from "react-redux";

import ACTIONS from "./actions/email";
import "./main.css";

// import Header from "./components/header/header";
import Routing from "./components/routing/routing";
import Spinner from "./components/spinner/spinner";

import { getCompanies } from "./services/services-lexon";

class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
      companies: [],
      isLoading: true
    };

    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleCheckAllclick = this.handleCheckAllclick.bind(this);
    this.handlePutUserFromLexonConnector = this.handlePutUserFromLexonConnector.bind(
      this
    );
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
      });
  }

  render() {
    const {
      isLoading,
      user,
      companies
    } = this.state;

    if (isLoading) {
      return <Spinner />;
    }

    return (
      <Fragment>
        {/* <Header title={"LEX-ON"} /> */}
        <Routing
          user={user}
          companies={companies}
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Main);
