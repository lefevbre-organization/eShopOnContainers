import React, { Component } from "react";
import GoogleButton from "react-google-button";
import i18n from "i18next";
import { Button } from "reactstrap";
import "./login.scss";
import { resetDefaultAccount } from "../../api/accounts";


export class Login extends Component {

goBack() {
   if (typeof this.props.lexon !== 'undefined') {
      const { userId } = this.props.lexon;
      if (userId !== null) {
          resetDefaultAccount(userId)
          .then(result => {
              const urlRedirect = `${window.URL_SELECT_ACCOUNT}/user/${userId}/encrypt/0`;
              window.open(urlRedirect, "_self");
          })
          .catch(error => {
              console.log("error =>", error);
          });
       }
   }
}

  render() {
    return (
      <div className="d-flex align-content-center align-items-center w-100 h-100 text-center">
        <div className="mx-auto ">
          <div className="form-box">
              <GoogleButton
                type="dark"
                onClick={this.props.onSignIn}
                label={i18n.t("login.button")}              
              />
              <Button
                className="mr-left font-weight-bold btn-outline-primary margin-top"
                title={i18n.t("login.cancel")}
                color="secondary"
                onClick={() => {
                  this.goBack();
                }}
              >
              {i18n.t("login.cancel")}
              </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;

