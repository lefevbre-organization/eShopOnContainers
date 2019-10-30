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
import "react-perfect-scrollbar/dist/css/styles.css";
import i18n from "i18next";

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
    
    let acronym = undefined;
    if (!picUrl) {
      if (fullName) {
        acronym = fullName
          .split(/\s/)
          .reduce((response, word) => (response += word.slice(0, 1)), "")
          .substring(0, 2);
      } else {
        acronym = " ";
      }
    }

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
              <img
                className="mx-2 profile-pic"
                src="assets/img/icon-user.png"
                alt={fullName}
              />
            </DropdownToggle>
            <DropdownMenu right>
              <DropdownItem header tag="div" className="user-image-and-name">
                <span className="dropdown-menu-arrow"></span>
                <a
                  href="#/"
                  className="text-right d-block pr-3 pt-3"
                  id="userInfo"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <span className="lf-icon-close" onClick={() => this.toggle()}></span>
                </a>
                <div className="content">
                  <div className="menu-title mb-5">
                    <span>{i18n.t("menu-user.user")}</span>
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
                          <span>{i18n.t("menu-user.edit-basic-data")}</span>
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
                          <span>{i18n.t("menu-user.reset-pwd")}</span>
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="user-image-and-name text-center">
                    <div className="user-image">
                      <a href="#/">
                        {acronym === undefined ? (
                          <img src={picUrl} alt={fullName} />
                        ) : (
                          <strong>{acronym}</strong>
                        )}
                      </a>
                    </div>
                    <span className="user-name">{fullName}</span>
                    <span className="company-name">
                      Lefebvre-El Derecho, S.A.
                    </span>

                    <PerfectScrollbar>
                      <ul className="other-accounts">
                        <li>
                          <a
                            href="#/"
                            className="d-flex align-items-center account-text"
                          >
                            <span>
                              <img
                                src="/assets/img/logoGoogle.png"
                                alt="Google"
                              />
                            </span>
                            <span>abogados-atocha@gmail.com</span>
                            <span className="lf-icon-arrow-exchange"></span>
                          </a>
                        </li>

                        <li>
                          <a
                            href="#/"
                            className="d-flex align-items-center account-text"
                          >
                            <span>
                              <img
                                src="/assets/img/logoMicrosoft.png"
                                alt="Microsoft"
                              />
                            </span>
                            <span>otracuentaoutlook@lefebvre.es</span>
                            <span className="lf-icon-arrow-exchange"></span>
                          </a>
                        </li>

                        <li>
                          <a
                            href="#/"
                            className="d-flex align-items-center account-text"
                          >
                            <span>
                              <img
                                src="/assets/img/logoGoogle.png"
                                alt="Google"
                              />
                            </span>
                            <span>abogados-vallecas@gmail.com</span>
                            <span className="lf-icon-arrow-exchange"></span>
                          </a>
                        </li>

                        <li>
                          <a
                            href="#/"
                            className="d-flex align-items-center account-text"
                          >
                            <span>
                              <img
                                src="/assets/img/logoMicrosoft.png"
                                alt="Microsoft"
                              />
                            </span>
                            <span>otracuentaoutlookmas@lefebvre.es</span>
                            <span className="lf-icon-arrow-exchange"></span>
                          </a>
                        </li>

                        <li>
                          <a
                            href="#/"
                            className="d-flex align-items-center account-text"
                          >
                            <span>
                              <img
                                src="/assets/img/logoGoogle.png"
                                alt="Google"
                              />
                            </span>
                            <span>abogados-torrejon@gmail.com</span>
                            <span className="lf-icon-arrow-exchange"></span>
                          </a>
                        </li>

                        <li>
                          <a
                            href="#/"
                            className="d-flex align-items-center account-text"
                          >
                            <span>
                              <img
                                src="/assets/img/logoGoogle.png"
                                alt="Google"
                              />
                            </span>
                            <span>abogados-velilla@gmail.com</span>
                            <span className="lf-icon-arrow-exchange"></span>
                          </a>
                        </li>

                        <li>
                          <a
                            href="#/"
                            className="d-flex align-items-center account-text"
                          >
                            <span>
                              <img
                                src="/assets/img/logoGoogle.png"
                                alt="Google"
                              />
                            </span>
                            <span>abogados-sanfernandodehenares@gmail.com</span>
                            <span className="lf-icon-arrow-exchange"></span>
                          </a>
                        </li>
                      </ul>
                    </PerfectScrollbar>

                    <a
                      href="#/"
                      className="d-flex align-items-center add-more-accounts"
                      onClick={this._handleOnClick}
                    >
                      <span className="lf-icon-add-round"></span>
                      <strong>{i18n.t("menu-user.add-other-account")}</strong>
                    </a>
                    <button
                      type="button"
                      className="col-6 btn btn-primary mt-3 mb-3"
                      onClick={() => onSignout}
                    >
                      {i18n.t("menu-user.close-session")}
                    </button>
                  </div>
                </div>
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
