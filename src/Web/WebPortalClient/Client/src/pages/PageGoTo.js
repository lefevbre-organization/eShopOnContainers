import React, { Component } from "react";
import Cookies from 'js-cookie';
import "./PageGoTo.css";
import GoTo from "../components/GoTo";
import Footer from "../components/footer/Footer";
import ConfirmRemoveAccount from "../components/confirm-remove-account/ConfirmRemoveAccount";
import { UserNotFound } from "../components/user-not-found/UserNotFound";
import Spinner from "../components/spinner/spinner";
import ReactNotification, { store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import { parseJwt, getUserId, buildClientUrl } from "../utils/jwt";
import { getAccounts, deleteAccountByUserAndEmail} from "../services/user-accounts";

export class PageGoTo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      accounts: [],
      userId: null,
      redirect: false,
      showConfirmRemoveAccount: false,
      emailRemoved: null,
      token: props.match.params.token,
      payload: parseJwt(props.match.params.token)
    };
    this.toggleConfirmRemoveAccount = this.toggleConfirmRemoveAccount.bind(
      this
    );
  }

  componentDidMount() {
    this.getAccounts();
  }

  canRedirect(account) {
    const { guid = '' } = account;   
    const GUID = Cookies.get(`Lefebvre.DefaultAccount.${account.user}`)
    return account.defaultAccount && GUID === guid;
  }

  async getAccounts() {
    const payload = this.state.payload;
    const userId = getUserId(payload);
    const encrypt = 0;

    getAccounts(userId, encrypt)
      .then(data => {

        var url = "";

        if (data.user === undefined || data.user === null) {
          this.setState({ loading: false, redirect: true });
        } else {
          this.setState({ loading: false, accounts: data.accounts, redirect: false, userId: userId });

          if (data.accounts.length !== 0) {
            const account = data.accounts[0];

            if (payload.idMail !== undefined && payload.mailAccount !== undefined && payload.mailAccount !== null){
              //Token trae info de un email para abrir
              const found = data.accounts.some(account => account.email === payload.mailAccount)
              if (!found){
                alert("No tiene configurada la cuenta asociada al email que quiere visualizar. Configúrela y pruebe de nuevo");
              }
              else {
                if (account.defaultAccount && (payload.mailAccount == account.email)) {
                  url = buildClientUrl(account.provider, `${account.provider.substring(0,2)}0${userId}`, this.state.payload);
                }
                else {
                  url = buildClientUrl(payload.provider.toUpperCase(), `${payload.provider.substring(0,2).toUpperCase()}0${userId}`, this.state.payload);
                }
              }
            }
            else {
              if (account.defaultAccount) {
	      	if (this.canRedirect(account)) {
                	url = buildClientUrl(account.provider, `${account.provider.substring(0,2)}0${userId}`, this.state.payload);
		}
              }
            }
            
            if (url !== ""){
              window.open(url, "_self");
            }
          }
        }
      })
      .catch(error => {
        console.log(error);
        store.addNotification({
          message: error,
          type: "danger",
          container: "bottom-center",
          animationIn: ["animated", "fadeIn"],
          animationOut: ["animated", "fadeOut"],
          dismiss: {
            duration: 5000,
            showIcon: true
          },
          width: 600
        });
      });
  }

  removeAccount = email => {
    const userId = this.props.match.params.userId;
    const encrypt = this.props.match.params.encrypt;

    deleteAccountByUserAndEmail(encrypt, userId, email)
      .then(result => {
        if (result.data > 0) {
          this.getAccounts();
        } else {
          const error = `Ha ocurrido un error cuando se borraba: userId -> ${userId}, email -> ${email}`;
          store.addNotification({
            message: error,
            type: "warning",
            container: "bottom-center",
            animationIn: ["animated", "fadeIn"],
            animationOut: ["animated", "fadeOut"],
            dismiss: {
              duration: 5000,
              showIcon: true
            },
            width: 600
          });
          
          console.log(error);
        }
      })
      .catch(error => {
        store.addNotification({
          message: error,
          type: "danger",
          container: "bottom-center",
          animationIn: ["animated", "fadeIn"],
          animationOut: ["animated", "fadeOut"],
          dismiss: {
            duration: 5000,
            showIcon: true
          },
          width: 600
        });

        console.log("error =>", error);
      });
  };

  toggleConfirmRemoveAccount(remove, email) {
    this.setState(state => ({
      showConfirmRemoveAccount: !state.showConfirmRemoveAccount,
      emailRemoved: email
    }));

    if (remove === true && email !== undefined) {
      this.removeAccount(email);
    }
  }

  renderSpinner() {
    const { loading } = this.state;

    if (loading) {
      return <Spinner />;
    }
  }

  renderGoTo() {
    const { loading, userId, accounts, token } = this.state;

    if (!loading) {
      return (
        <GoTo
          userId={userId}
          accounts={accounts}
          removeAccount={this.removeAccount}
          toggleConfirmRemoveAccount={this.toggleConfirmRemoveAccount}
          token={token}
        />
      );
    }
  }

  renderFooter() {
    const { loading } = this.state;

    if (!loading) {
      return <Footer />;
    }
  }

  render() {
    const { redirect, showConfirmRemoveAccount, emailRemoved } = this.state;

    if (redirect) {
      return <UserNotFound />;
    }

    return (
      <React.Fragment>
        <ReactNotification />
        <ConfirmRemoveAccount
          initialModalState={showConfirmRemoveAccount}
          toggleConfirmRemoveAccount={this.toggleConfirmRemoveAccount}
          email={emailRemoved}
        />
        <div>
          {this.renderSpinner()}
          <div className="container-fluid d-flex h-100 flex-column" id="borrar">
            {this.renderGoTo()}
            {this.renderFooter()}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default PageGoTo;
