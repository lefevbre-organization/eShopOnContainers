import React, { Component } from 'react';
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
import { getUser, resetDefaultAccount } from '../../api/accounts';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import i18n from 'i18next';

class MenuUser extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dropdownOpen: false,
      accounts: [],
      disconnect: true,
      showSign: false
    };

    this.toggle = this.toggle.bind(this);
    this._handleOnClick = this._handleOnClick.bind(this);
    this.onSignClick = this.onSignClick.bind(this);
  }

  componentDidMount() {
    const { lexon } = this.props;
    const _this = this;
    if (lexon.userId) {
      getUser(lexon.userId)
        .then(result => {
          if (result.errors.length === 0) {
            _this.setState({
              accounts: result.data.accounts.filter(
                account => account.defaultAccount !== true
              )
            });
          } else {
            let errors;
            result.errors.forEach(function(error) {
              errors = `${error} `;
            });
            console.log('error ->', errors);
          }
        })
        .catch(error => {
          console.log('error ->', error);
        });
    }
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  _handleOnClick() {
    const { userId } = this.props.lexon;
    if (userId !== null) {
      resetDefaultAccount(userId)
        .then(result => {
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

  render() {
    const { dropdownOpen, accounts } = this.state;
    const {
      picUrl,
      fullName,
      onSignout,
      onSignoutDisconnect,
      lexon
    } = this.props;

    let acronym = undefined;
    if (!picUrl) {
      if (fullName) {
        acronym = fullName
          .split(/\s/)
          .reduce((response, word) => (response += word.slice(0, 1)), '')
          .substring(0, 2);
      } else {
        acronym = ' ';
      }
    }

    return (
      <div className='menu-user'>
        <Nav className='ml-auto' navbar>
          <NavItem className='d-md-down-none'>
            <NavLink href='#'>
              <i className='icon-location-pin'></i>
            </NavLink>
          </NavItem>
          <Dropdown nav isOpen={dropdownOpen} toggle={this.toggle}>
            <DropdownToggle nav>
              <img
                className='mx-2 profile-pic'
                src='assets/img/icon-user.png'
                alt={fullName}
              />
            </DropdownToggle>
            <div
              className={
                this.state.showSign
                  ? 'show-sign .menu-container '
                  : '.menu-container '
              }>
              <DropdownMenu right id='user-box'>
                <DropdownItem header tag='div' className='user-image-and-name'>
                  <span className='dropdown-menu-arrow'></span>
                  <a
                    href='#/'
                    className='text-right d-block pr-3 pt-3'
                    id='userInfo'
                    data-toggle='dropdown'
                    aria-haspopup='true'
                    aria-expanded='false'>
                    <span
                      className='lf-icon-close'
                      onClick={() => this.toggle()}></span>
                  </a>
                  <div className='content'>
                    <div className='menu-title mb-5'>
                      <span>{i18n.t('menu-user.user')}</span>
                    </div>

                    <div className='user-image-and-name text-center'>
                      <div className='user-image'>
                        <a href='#/'>
                          {acronym === undefined ? (
                            <img src={picUrl} alt={fullName} />
                          ) : (
                            <strong>{acronym}</strong>
                          )}
                        </a>
                      </div>
                      <span className='user-name'>{fullName}</span>
                      <span className='company-name'>
                        Lefebvre-El Derecho, S.A.
                      </span>
                      <div className='add-sign' onClick={this.onSignClick}>
                        <span className='lf-icon lf-icon-feather'></span>
                        <p>Firma de correo electrónico</p>
                      </div>
                      <PerfectScrollbar>
                        <ul className='other-accounts'>
                          {accounts.map(account => (
                            <AccountUser key={account.id} account={account} />
                          ))}
                        </ul>
                      </PerfectScrollbar>
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
                      <button
                        type='button'
                        className='col-6 btn btn-primary mt-3 mb-3'
                        onClick={onSignout}>
                        {i18n.t('menu-user.close-session')}
                      </button>
                    </div>
                  </div>
                </DropdownItem>
                <div disabled className='version'>
                  {i18n.t('menu-user.version')}: {window.RELEASE}
                </div>
              </DropdownMenu>
            </div>
          </Dropdown>
        </Nav>

        <style jsx>{`
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

          .add-sign .lf-icon-feather {
            font-size: 20px;
          }

          .add-sign p {
            text-decoration: underline;
            padding: 0;
            margin: 0;
            margin-left: 5px;
          }

          .menu-container {
            transition: all 2s;
          }
          .show-sign {
            z-index: 1;
          }

          .menu-user {
            padding-right: 60px;
            z-index: 1;
          }
        `}</style>
      </div>
    );
  }
}

MenuUser.propTypes = {
  picUrl: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  fullName: PropTypes.string.isRequired,
  onSignout: PropTypes.func.isRequired,
  onSignoutDisconnect: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  lexon: state.lexon
});

export default connect(mapStateToProps)(MenuUser);
