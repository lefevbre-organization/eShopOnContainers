import React, { Component, Fragment } from "react";
import { connect } from "react-redux";

import ACTIONS from "./actions/lex-on_message-list.actions";
import "./main.css";

import Header from "./components/header/header";
import SelectCompany from "./components/select-company/select-company";

class Main extends Component {
  constructor(props) {
    super(props);

    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleCheckAllclick = this.handleCheckAllclick.bind(this);
  }

  componentDidMount() {
    window.addEventListener("Checkclick", this.handleKeyPress);
    window.addEventListener("CheckAllclick", this.handleCheckAllclick);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
    window.removeEventListener("Checkclick", this.handleKeyPress);
    window.removeEventListener("CheckAllclick", this.handleCheckAllclick);
  }

  handleKeyPress(event) {
    event.detail.chkselected
      ? this.props.addMessage(event.detail.name)
      : this.props.deleteMessage(event.detail.name);
  }

  handleCheckAllclick(event) {
    console.log("handleCheckAllclick [event] ->", event);
    event.detail.chkselected
      ? this.props.addListMessages(event.detail.listMessages)
      : this.props.deleteListMessages(event.detail.listMessages);
  }

  render() {
    return (
      <Fragment>
        <Header title={"LEX-ON"} />
        <SelectCompany />
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
