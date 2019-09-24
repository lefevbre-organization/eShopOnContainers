import React, { Component } from "react";

class SendMessage extends Component {
  toggle(event) {
    const { target } = event;
    window.dispatchEvent(
      new CustomEvent("Checkclick", {
        detail: {
          name: target.name,
          chkselected: target.checked
        }
      })
    );
  }

  render() {
    return (
      <div>
        <input
          type="checkbox"
          name="message1"
          id="option1"
          onClick={this.toggle.bind(this)}
        />
        <label for="option1">
          <strong>Message 1</strong>
        </label>
        <br />
        <input
          type="checkbox"
          name="message2"
          id="option2"
          onClick={this.toggle.bind(this)}
        />
        <label for="option2">
          <strong>Message 2</strong>
        </label>
        <br />
        <input
          type="checkbox"
          name="message3"
          id="option3"
          onClick={this.toggle.bind(this)}
        />
        <label for="option3">
          <strong>Message 3</strong>
        </label>
      </div>
    );
  }
}

export default SendMessage;
