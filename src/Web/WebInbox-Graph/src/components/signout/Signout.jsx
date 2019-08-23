import React, { Component } from "react";


export class Signout extends Component {
  render() {
      return <div title="Sign out of Microsoft" onClick={this.props.onSignout} className='btn btn-outline-secondary ml-auto'>Sign Out</div>;
  }
}

export default Signout;
