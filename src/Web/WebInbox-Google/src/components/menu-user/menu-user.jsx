import React, { Component } from "react";
import "./menu-user.css";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  Nav,
  NavItem,
  NavLink,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle
} from "reactstrap";
import { config, RESULT_OK, PROVIDER } from "../../constants";
import AccountUser from "./account-user/account-user";
import PerfectScrollbar from "react-perfect-scrollbar";

class MenuUser extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dropdownOpen: false,
      accounts: []
    };

    this.toggle = this.toggle.bind(this);
    this._handleOnClick = this._handleOnClick.bind(this);
  }

  componentDidMount() {
    const { lexon } = this.props;
    const _this = this;
    if (lexon.userId) {
      const url = `${config.url.URL_GET_ACCOUNTS}/${lexon.userId}`;
      fetch(url, {
        method: "GET"
      })
        .then(data => data.json())
        .then(result => {
          if (result.status === RESULT_OK) {
            _this.setState({
              accounts: result.result.filter(
                account => account.provider !== PROVIDER
              )
            });
          } else {
            console.log("error ->", result.despcription);
          }
        });
    }
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  _handleOnClick(e) {
    const { userId } = this.props.lexon;
    if (userId !== null) {
      const url = `${config.url.URL_RESET_DEFAULTACCOUNT}/${userId}`;
      fetch(url, {
        method: "GET"
      })
        .then(result => {
          console.log("result =>", result);
        })
        .catch(error => {
          console.log("error =>", error);
        });

      const urlRedirect = `${config.url.URL_SELECT_ACCOUNT}/user/${userId}/encrypt/0`;
      window.open(urlRedirect, "_self");
    }
  }

  render() {
    const { dropdownOpen, accounts } = this.state;
    const { picUrl, email, fullName, onSignout } = this.props;

    return (
      <div className="menu-user">
        <Nav className="ml-auto" navbar>
          <NavItem className="d-md-down-none">
            <NavLink href="#">
              <i className="icon-location-pin"></i>
            </NavLink>
          </NavItem>
          <Dropdown nav isOpen={dropdownOpen} toggle={this.toggle}>
            <DropdownToggle nav>
              {/* <img
                className="mx-2 profile-pic img-circle"
                src={picUrl}
                alt=""
              /> */}
              <a
                href="#/"
                className="d-flex align-items-center header-user-image"
                id="userInfo"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                data-display="static"
              >
                <span className="lf-icon-user"></span>
                <span className="pl-2 d-none d-md-block user-name">
                  {fullName}
                </span>
              </a>
            </DropdownToggle>
            <DropdownMenu right>
              <DropdownItem
                header
                tag="div"
                className="user-image-and-name text-center"
              >
                <span className="dropdown-menu-arrow"></span>
                <a
                  href="#/"
                  className="text-right d-block pr-3 pt-3"
                  id="userInfo"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <span className="lf-icon-close"></span>
                </a>

                <div className="menu-title mb-5">
                  <span className="d-flex align-items-left">{email}</span>
                </div>
                <div className="user-options">
                  <ul className="p-0">
                    <li>
                      <a
                        href="#/"
                        className="d-flex align-items-center"
                        data-toggle="modal"
                        data-target="#basicData"
                      >
                        <span className="lf-icon-lead"></span>{" "}
                        <span>Editar datos básicos</span>
                      </a>
                    </li>
                    <li>
                      <a
                        href="#/"
                        className="d-flex align-items-center"
                        data-toggle="modal"
                        data-target="#resetPassword"
                      >
                        <span className="lf-icon-lock"></span>{" "}
                        <span>Resetear contraseña</span>
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="user-image">
                  <a href="#/">
                    <img alt={email} src={picUrl} />
                  </a>
                </div>
                <span className="user-name">{fullName}</span>
                <span className="company-name">Lefebvre-El Derecho, S.A.</span>

                <a href="#/" className="d-flex align-items-center add-more">
                  <span className="lf-icon-add-round"></span>
                  <strong>Añadir otra cuenta</strong>
                </a>

                {/* <strong title={email}>{fullName}</strong> */}
              </DropdownItem>
              {/* <DropdownItem divider />
              <DropdownItem onClick={this._handleOnClick}>
                <a href="#/" className="d-flex align-items-center add-more">
                  <span class="lf-icon-add-round"></span>
                  <strong>Añadir otra cuenta</strong>
                </a>
                <i className="fa fa-shield"></i> Settings
              </DropdownItem> */}
              {/* <DropdownItem divider /> */}

              <PerfectScrollbar>
                <div>
                  {accounts.map(account => {
                    return (
                      <AccountUser account={account} key={account.email} />
                    );
                  })}
                  {accounts.map(account => {
                    return (
                      <AccountUser account={account} key={account.email} />
                    );
                  })}
                  {accounts.map(account => {
                    return (
                      <AccountUser account={account} key={account.email} />
                    );
                  })}
                  {accounts.map(account => {
                    return (
                      <AccountUser account={account} key={account.email} />
                    );
                  })}
                </div>
              </PerfectScrollbar>

              <DropdownItem divider />
              <DropdownItem onClick={onSignout}>
                <i className="fa fa-lock"></i> Logout
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </Nav>
      </div>
    );
  }
}

MenuUser.propTypes = {
  picUrl: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  fullName: PropTypes.string.isRequired,
  onSignout: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  lexon: state.lexon
});

export default connect(mapStateToProps)(MenuUser);
