import React, { Component } from "react";
import "./account-user.css";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { config } from "../../constants";

class AccountUser extends Component {
  constructor(props) {
    super(props);

    this._handleOnClick = this._handleOnClick.bind(this);
  }

  _handleOnClick(provider) {
    const { userId } = this.props.lexon;

    switch (provider) {
      case "GOOGLE":
        window.open(`${config.url.URL_MF_GOOGLE}/GO0${userId}`, "_self");

        break;
      case "OUTLOOK":
        window.open(`${config.url.URL_MF_OUTLOOK}/OU0${userId}`, "_self");

        break;

      default:
        window.open(`${config.url.URL_MF_IMAP}/IM0${userId}`, "_self");

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
      <li
        className="lidropdownitem"
        onClick={() => this._handleOnClick(account.provider)}
      >
        <a href="#/" className="dropdownitem">
          <span>
            <img src={this.getImage(account.provider)} alt={account.provider} />
          </span>
          <span className="email">{account.email}</span>
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
