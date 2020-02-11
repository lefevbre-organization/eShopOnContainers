import React from "react";
import { withTranslation } from "react-i18next";
import { Button } from "reactstrap";
import "./Login.scss";
import { resetDefaultAccount } from "../../api_graph/accounts";

function MSAuthButton(props) {
  return (
    <a href="/#" className="login" onClick={props.authButtonMethod}>
      <img
        border="0"
        alt="Microsoft"
        className="w3-btn"
        src="/assets/img/singinms.png"
      ></img>
    </a>
  );
}

export class Login extends React.Component {

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
        const { t } = this.props;
    return (
      <div className="d-flex align-content-center align-items-center w-100 h-100 text-center w3-btn">
        <div className="mx-auto">
          <div className="form-box">
              <div>
                <MSAuthButton
                  isAuthenticated={this.props.isAuthenticated}
                  user={this.props.user}
                  authButtonMethod={this.props.authButtonMethod}
                  logout={this.props.logout}
                />
                <Button
                   className="mr-left font-weight-bold btn-outline-primary margin-top"
                   title={t("login.cancel")}
                   color="secondary"
                   onClick={() => {
                      this.goBack();
                   }}
                >
                {t("login.cancel")}
                           
                </Button>
               </div>
          </div>
        </div>
      </div>
    );
  }
}
export default withTranslation() (Login);