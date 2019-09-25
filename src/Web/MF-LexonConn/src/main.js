import React, { Component, Fragment } from "react";
import { connect } from "react-redux";

import ACTIONS from "./actions/lex-on_message-list.actions";
import "./main.css";

import Header from "./components/header/header";
import SelectCompany from "./components/select-company/select-company";
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

  async getCompanies(user) {
    getCompanies(user);
  }

  sendMessageGetUser() {
    console.log('IN ... MF-LexonConnector [sendMessageGetUser]');
    window.dispatchEvent(new CustomEvent("GetUserFromLexonConnector"));
  }

  async handlePutUserFromLexonConnector(event) {
    const user = event.detail.user;
    getCompanies(user)
    .then(result => {
      this.setState({ isLoading: false, user: user, companies: result.companies });
    })
    .catch(error => {
      console.log('error ->', error);
    });
  }

  render() {
    const { isLoading, user, companies } = this.state;

    if (isLoading) {
      return <Spinner />;
    }

    return (
      <Fragment>
        {/* <Header title={"LEX-ON"} /> */}
        <SelectCompany user={user} companies={companies} />
        <div className="container">
          <div className="row">
            <div className="col-12 form-selection-business">
              <h3>Lista de Mensajes</h3>
              {this.props.selectedMessages.map(message => (
                <div key={message}>{message}</div>
              ))}
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    selectedMessages: state.selectedMessages
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
