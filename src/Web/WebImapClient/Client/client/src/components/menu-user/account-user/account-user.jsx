import React, { Component } from "react";
import "./account-user.css";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { removeStateExLexon } from "../../../services/state";

class AccountUser extends Component {
  constructor(props) {
    super(props);

    this._handleOnClick = this._handleOnClick.bind(this);
  }

  _handleOnClick(provider) {
    const { userId } = this.props.lexon;

    switch (provider) {
      case "GOOGLE":
        window.open(`${window.URL_MF_GOOGLE}/GO0${userId}`, "_self");
        break;

      case "OUTLOOK":
        window.open(`${window.URL_MF_OUTLOOK}/OU0${userId}`, "_self");
        break;

      default:           
          removeStateExLexon();
          window.location.reload();           
        break;
    }
  }

  getImage(provider) {
    switch (provider) {
      case "GOOGLE":
        return "/assets/images/logoGoogle.png";
      case "OUTLOOK":
        return "/assets/images/logoMicrosoft.png";

      default:
        return "/assets/images/logoImap.png";
    }
  }

  render() {
    const { account } = this.props;

    return (
      <li>
        <a
          href="#/"
          className="d-flex align-items-center account-text"
          onClick={() => this._handleOnClick(account.provider)}
        >
          <span>
            <img src={this.getImage(account.provider)} alt={account.provider} />
          </span>
          <span>{account.email}</span>
          <span className="lf-icon-arrow-exchange"></span>
        </a>
      </li>
    );
  }
}

AccountUser.propTypes = {
  account: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  lexon: state.lexon
});

export default connect(mapStateToProps)(AccountUser);
