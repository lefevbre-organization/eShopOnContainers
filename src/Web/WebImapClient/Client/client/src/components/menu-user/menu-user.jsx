import React, { Component, Fragment } from 'react';
import './menu-user.css';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Nav,
  NavItem,
  NavLink,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle
} from 'reactstrap';
import AccountUser from './account-user/account-user';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import i18n from 'i18next';
import { removeState } from '../../services/state';
import { clearUserCredentials } from '../../actions/application';
import {
  getUser,
  resetDefaultAccount,
  addOrUpdateAccount
} from '../../services/accounts';
import { setSign } from '../../actions/lexon';
import UserSign from './menu-user-sign';

class MenuUser extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dropdownOpen: false,
      accounts: [],
      disconnect: true,
      showSign: false,
      sign: ''
    };

    this.wrapperRef = null;
    this.buttonRef = null;

    this.toggle = this.toggle.bind(this);
    this._handleOnClick = this._handleOnClick.bind(this);
    this.onSignClick = this.onSignClick.bind(this);
    this.onBack = this.onBack.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.onSaveSign = this.onSaveSign.bind(this);
    this.onSignChange = this.onSignChange.bind(this);
  }

  componentDidMount() {
    const { lexon } = this.props;
    if (lexon.userId) {
      getUser(lexon.userId)
        .then(result => {
          if (result.errors.length === 0) {
            this.setState({
              sign: result.data.accounts[0].sign,
              accounts: result.data.accounts.filter(
                account => account.defaultAccount !== true
              )
            });
          } else {
            let errors;
            result.errors.forEach(error => {
              errors = `${error} `;
            });
            console.log('error ->', errors);
          }
        })
        .catch(error => {
          console.log('error ->', error);
        });
    }

    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  handleClickOutside(event) {
    const { showSign } = this.state;
    const { onToggleDialog } = this.props;

    if (showSign === true) {
      event.stopPropagation();
      return;
    }
    if (
      this.wrapperRef &&
      this.buttonRef &&
      !this.wrapperRef.contains(event.target) &&
      !this.buttonRef.contains(event.target)
    ) {
      this.setState(
        {
          dropdownOpen: false,
          showSign: false
        },
        () => {
          if (onToggleDialog) {
            onToggleDialog(this.state.dropdownOpen);
          }
        }
      );
    }
  }

  toggle() {
    const { onToggleDialog } = this.props;
    this.setState(
      {
        dropdownOpen: !this.state.dropdownOpen,
        showSign: false
      },
      () => {
        if (onToggleDialog) {
          onToggleDialog(this.state.dropdownOpen);
        }
      }
    );
  }

  _handleOnClick() {
    const { userId } = this.props.lexon;
    if (userId !== null) {
      resetDefaultAccount(userId)
        .then(() => {
          this.routeLogout();
          const urlRedirect = `${window.URL_SELECT_ACCOUNT}/user/${userId}/encrypt/0`;
          window.open(urlRedirect, '_self');
        })
        .catch(error => {
          console.log('error =>', error);
        });
    }
  }

  onSignClick() {
    const { showSign } = this.state;
    this.setState({ showSign: !showSign });
  }

  onBack() {
    this.setState({
      showSign: false
    });
  }

  onSignChange(content) {
    this.setState({ sign: content });
  }

  async onSaveSign() {
    const fullName = this.props.login.formValues.user;

    const { lexon } = this.props;
    const { sign } = this.state;
    const newAccount = {
      provider: 'OUTLOOK',
      email: fullName,
      guid: lexon.guid,
      sign
    };

    this.props.setSign(sign);
    await addOrUpdateAccount(lexon.userId, newAccount);
    this.onBack();
  }

  routeLogout() {
    const { userId } = this.props.lexon;
    if (userId !== null) {
      resetDefaultAccount(userId)
        .then(result => {
          console.log(result);
          removeState();
        })
        .then(() => {
          //Call action to reset all redux info
          this.props.logout();
          const urlRedirect = `${window.URL_SELECT_ACCOUNT}/user/${userId}/encrypt/0`;
          window.open(urlRedirect, '_self');
        });
    } else {
      removeState();
      window.location.reload();
    }
  }

  render() {
    const { dropdownOpen, accounts } = this.state;
    const { lexon } = this.props;
    const fullName = this.props.login.formValues.user;
    const { showSign, sign } = this.state;

    let acronym;
    if (fullName) {
      acronym = fullName
        .split(/\s/)
        .reduce((response, word) => (response += word.slice(0, 1)), '')
        .substring(0, 2);
    } else {
      acronym = '?';
    }

    return (
      <Fragment>
        <div
          className='menu-user'
          onClick={this.toggle}
          ref={ref => (this.buttonRef = ref)}>
          <img
            className='mx-2 profile-pic'
            src='assets/images/icon-user.png'
            alt={fullName}
          />
        </div>
        {dropdownOpen === true && (
          <div>
            <span className='dropdown-menu-arrow'></span>
            <div
              className={
                showSign ? 'show-sign menu-container ' : 'menu-container '
              }
              ref={ref => (this.wrapperRef = ref)}>
              <div className='content'>
                <div className='header' style={{ marginTop: 20 }}>
                  <span className='lf-icon-close' onClick={this.toggle}></span>
                  <div className='menu-title'>
                    <span>
                      {showSign === false
                        ? i18n.t('menu-user.user')
                        : 'Firma de correo electrónico'}
                    </span>
                  </div>
                  {showSign === true && (
                    <div className='mu-subheader'>
                      <span>
                        Tu firma se añadirá automáticamente en todos los
                        mensajes que redactes, respondas o reenvíes.
                      </span>
                    </div>
                  )}
                </div>

                <div className='user-image-and-name'>
                  {showSign === false && (
                    <Fragment>
                      <div className='user-image text-center'>
                        <a href='#/'>
                          {acronym === undefined ? (
                            <img src={picUrl} alt={fullName} />
                          ) : (
                            <strong>{acronym}</strong>
                          )}
                        </a>
                      </div>
                      <span className='user-name text-center'>{fullName}</span>
                      <span className='company-name text-center'>
                        Lefebvre-El Derecho, S.A.
                      </span>
                      <div className='add-sign' onClick={this.onSignClick}>
                        <span className='lf-icon lf-icon-feather'></span>
                        <p>Firma de correo electrónico</p>
                      </div>
                      <div className='accounts-container'>
                        <PerfectScrollbar options={{ suppressScrollX: true }}>
                          <ul className='other-accounts'>
                            {accounts.map(account => (
                              <AccountUser key={account.id} account={account} />
                            ))}
                          </ul>
                        </PerfectScrollbar>
                      </div>
                      {lexon.user ? (
                        <a
                          href='#/'
                          className='d-flex align-items-center add-more-accounts'
                          onClick={this._handleOnClick}>
                          <span className='lf-icon-add-round'></span>
                          <strong>
                            {i18n.t('menu-user.add-other-account')}
                          </strong>
                        </a>
                      ) : null}
                      <div className='text-center'>
                        <button
                          type='button'
                          className='col-6 btn btn-primary mt-3 mb-3'
                          onClick={() => this.routeLogout()}>
                          {i18n.t('menu-user.close-session')}
                        </button>
                      </div>
                    </Fragment>
                  )}
                  {showSign === true && (
                    <Fragment>
                      <UserSign
                        onChange={this.onSignChange}
                        defaultValue={sign}
                      />
                      <div className='buttons-footer'>
                        <button
                          type='button'
                          className='mr-left font-weight-bold btn-outline-primary btn btn-secondary'
                          onClick={this.onBack}>
                          Cancelar
                        </button>
                        <button
                          type='button'
                          className='mr-left font-weight-bold btn-primary btn'
                          onClick={this.onSaveSign}>
                          Guardar
                        </button>
                      </div>
                    </Fragment>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        <style jsx>{`
          header h1 {
            color: black;
          }
          .buttons-footer {
            position: absolute;
            bottom: 10px;
            right: 10px;
          }

          .buttons-footer button {
            margin-right: 15px;
          }

          .buttons-footer button:hover {
            margin-right: 15px;
          }

          .menu-user {
            cursor: pointer;
          }

          .add-more-accounts > span {
            color: #001978 !important;
          }

          .menu-container {
            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
              0 6px 20px 0 rgba(0, 0, 0, 0.19);
            border: 1px solid #cdd1e0;
            border-radius: 0;
            color: #001978;
          }

          .show-sign.menu-container {
            width: 800px;
            height: 446px;
          }

          .dropdown-menu-arrow {
            /* display: inline; */
            top: 5px;
            right: 13px;
            position: absolute;
            left: auto;
            width: 24px;
            height: 24px;
          }

          .mu-subheader {
            font-family: MTTMilano, Lato, Arial, sans-serif;
            cursor: default;
            text-align: left !important;
            color: #333333 !important;
            font-size: 14px;
          }

          .dropdown-menu-arrow:before {
            bottom: -13px;
            right: -8px;
            border-bottom-color: rgba(0, 0, 0, 0.15);
          }

          .dropdown-menu-arrow:after {
            bottom: -13px;
            right: -8px;
            border-bottom-color: #fff;
          }

          .accounts-container {
            text-align: center;
          }

          .user-image-and-name {
            padding: 24px;
          }

          .lf-icon-add-round {
            color: #001978;
          }
          .content .header {
            background-color: white;
            text-align: right;
            border: none;
            display: block;
            padding-left: 24px;
            padding-right: 24px;
            font-size: 0.875rem;
            color: #6c757d;
            white-space: nowrap;
          }
          .content .header > span {
            color: #001978;
            font-size: 13px;
            cursor: pointer;
          }

          .user-image-and-name .scrollbar-container {
            width: 100%;
          }

          .menu-container {
            position: absolute;
            background-color: white;
            top: 40px;
            right: -30px;
            width: 385px;
            z-index: 110;
            cursor: default;
          }

          .menu-title {
            font-size: 18px;
            font-weight: 500;
            border-bottom: 1px solid;
            padding-bottom: 5px;
            text-align: left;
            color: #001978;
          }
          .menu-title .mb-5 {
            text-decoration: none;
            color: #001978 !important;
          }

          .add-sign {
            display: flex;
            align-items: center;
            font-size: 16px;
            font-family: MTTMilano-Bold, Lato, Arial, sans-serif;
            justify-content: center;
            color: #001978;
            cursor: pointer;
            margin-bottom: 10px;
          }
          .add-sign p {
            text-decoration: underline;
            padding: 0;
            margin: 0;
            margin-left: 5px;
          }
          .add-sign .lf-icon-feather {
            font-size: 20px;
            color: #001978;
          }

          .e-content.e-lib.e-keyboard {
            text-align: left;
          }
        `}</style>
      </Fragment>
    );
  }
}

MenuUser.propTypes = {
  fullName: PropTypes.string.isRequired
};

const mapStateToProps = state => ({
  lexon: state.lexon,
  login: state.login
});

const mapDispatchToProps = dispatch => ({
  logout: () => {
    dispatch(clearUserCredentials());
    //history.push("/login");
  },
  setSign: sign => {
    dispatch(setSign(sign));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(MenuUser);
