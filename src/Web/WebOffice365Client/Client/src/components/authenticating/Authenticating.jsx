import React, { Component } from "react";
import "./Authenticating";

function WelcomeContent(props) {
  // If authenticated, greet the user
  if (props.isAuthenticated) {
    return (
      <div>
        <h4>Welcome {props.user.displayName}!</h4>
        <p>Use the navigation bar at the top of the page to get started.</p>
      </div>
    );
  }

  // Not authenticated, present a sign in button
  //return <Button color="primary" onClick={props.authButtonMethod}>Click here to sign in</Button>;
  alert("7");
  return (
    <a href="#/" onClick={props.authButtonMethod}>
      <img border="0" alt="Microsoft" src="assets/img/singinms.png"></img>
    </a>
  );
}

export class Authenticating extends Component {
  render() {
    return (
      <div
        className="d-flex align-content-center align-items-center w-100 h-100 text-center w3-btn"
        // style="box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);"
      >
        <div className="mx-auto">
          <div>
            <WelcomeContent
              isAuthenticated={this.props.isAuthenticated}
              user={this.props.user}
              authButtonMethod={this.props.authButtonMethod}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Authenticating;
