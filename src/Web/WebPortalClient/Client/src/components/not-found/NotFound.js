import React, { Component} from "react";
import "./NotFound.css";

const stateFromParams = params => ({
    userId: params.has('user') ? params.get('user') : '',
    encrypt: params.has('encrypt') ? params.get('encrypt') : '',
    redirect: params.has('redirect') ? params.get('redirect') : ''
});

class NotFound extends Component{

  constructor(props) {
    super(props);

    this.state = stateFromParams(new URLSearchParams(this.props.location.search));
    console.log("Estado:" + this.state);
  }
  
  render(){
    if (this.state.userId) {
      if (this.state.redirect && this.state.redirect !== '' && this.state.redirect === "true"){
        const urlRedirect = `${window.URL_INBOX_OUTLOOK}/user/OU0${this.state.userId}`;
        window.open(urlRedirect, "_self");
        return null;
      }
      else {
        const urlRedirect = `${window.URL_SELECT_ACCOUNT}/user/${this.state.userId}/encrypt/0`;
        window.open(urlRedirect, "_self");
        return null;
      }
    } else {
    return (
      <div className="d-flex w-100 h-100 flex-column justify-content-center align-items-center vertical-center">
        <div className="h1">404 ERROR</div>
        <div>Page not found.</div>
      </div>
    );
    }
  }
}

export default NotFound;