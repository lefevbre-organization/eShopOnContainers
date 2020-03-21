import React, { PureComponent } from 'react';
import './header.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import debounce from 'lodash/debounce';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle
} from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { connect } from 'react-redux';
import MenuUser from '../menu-user/menu-user';
import i18n from 'i18next';
import { resetDefaultAccount } from '../../api/accounts';

export class Header extends PureComponent {
  constructor(props) {
    super(props);

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSearchClick = this.handleSearchClick.bind(this);
    this._handleOnClick = this._handleOnClick.bind(this);
    this.performSearch = debounce(this.performSearch.bind(this), 1000);

    this.toggle = this.toggle.bind(this);
    this.toggleMenu = this.toggleMenu.bind(this);
    this.state = {
      dropdownOpen: false,
      dropdownMenuOpen: false
    };
  }

  _handleOnClick(e) {
    const { userId, token } = this.props.lexon;
    if (userId !== null) {
      resetDefaultAccount(userId)
        .then(() => {
          const urlRedirect = (token) ? `${window.URL_SELECT_ACCOUNT}/access/${token}` : `${window.URL_SELECT_ACCOUNT}/user/${userId}/encrypt/0`;
          window.open(urlRedirect, '_self');
        })
        .catch(error => {
          console.log('error =>', error);
        });
    }
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  toggleMenu() {
    this.setState({
      dropdownMenuOpen: !this.state.dropdownMenuOpen
    });
  }

  handleSearchClick(evt) {
    if (this.props.searhQuery !== '') {
      this.performSearch();
    }
  }

  handleInputChange(evt) {
    this.props.setSearchQuery(evt.target.value);
    this.performSearch();
  }

  performSearch() {
    const searchParams = {};
    if (!this.props.searchQuery || this.props.searchQuery === '') {
      searchParams.labelIds = ['INBOX'];
    }
    this.props.getLabelMessages({ ...searchParams });
  }

  render() {
    const userInfo = this.props.googleUser.Rt;
    const email = userInfo.Au;
    const fullName = userInfo.Ad;
    const picUrl = userInfo.kL;

    return (
      <header className='d-flex p-3 align-content-center align-items-center header '>
        <div className='justify-content-left'>
          <Link to='/inbox'>
            <img
              border='0'
              alt='lefebvre'
              src='assets/img/LogoLefebvre.png'></img>
          </Link>
        </div>
        <div className='header-logo justify-content-center'>
          {/*<Link to="/inbox"><img border="0" alt="gmail" src="assets/img/logo-elderecho.png"></img></Link>
                    <Link to="/inbox"><img className="logo-ext" border="0" alt="otulook" src="assets/img/gmail.png"></img></Link> */}
        </div>
        <div className='header-search'>
          <div className='input-group w-75 ml-1 mr-auto'>
            <input
              type='search'
              className='form-control search'
              placeholder={i18n.t('header.search')}
              value={this.props.searchQuery}
              onChange={this.handleInputChange}
            />
            <div
              className='input-group-append'
              onClick={this.handleSearchClick}>
              <button
                className='btn btn-light  bg-white text-dark btn-search'
                type='button'>
                <FontAwesomeIcon icon={faSearch} />
              </button>
            </div>
          </div>
          {/*<div className="header-logo justify-content-center">
                        <Link to="/inbox"><img className="logo-ext" border="0" alt="otulook" src="assets/img/gmail.png"></img></Link>                       
                    </div>*/}

          <MenuUser
            picUrl={picUrl}
            email={email}
            fullName={fullName}
            onSignout={this.props.onSignout}
            onSignoutDisconnect={this.props.onSignoutDisconnect}
          />
            Testing 1
          <div>
            <Nav className='ml-auto' navbar>
              <NavItem className='d-md-down-none'>
                <NavLink href='#'>
                  <i className='icon-location-pin'></i>
                </NavLink>
              </NavItem>
              <Dropdown
                nav
                isOpen={this.state.dropdownMenuOpen}
                toggle={this.toggleMenu}>
                <DropdownToggle nav>
                  <img src='assets/img/icon-products.png' alt='' />
                </DropdownToggle>
                <DropdownMenu right>
                  {/* <DropdownItem>
                    <i className="fa fa-shield"></i> Calendar
                  </DropdownItem>
                  <DropdownItem>
                    <i className="fa fa-shield"></i> File Manager
                  </DropdownItem>
                  <DropdownItem>
                    <i className="fa fa-shield"></i>
                    <span onClick={this._handleOnClick}>
                      {" "}
                      Configure New Account
                    </span>
                  </DropdownItem>
                  <DropdownItem divider /> */}
                  <DropdownItem>
                    <span
                      onClick={() =>
                        window.open('https://www.lex-on.es/', '_self')
                      }>
                      <i className='fa fa-lock'></i>{' '}
                      {i18n.t('header.returnlexon')}
                    </span>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </Nav>
          </div>
        </div>
      </header>
    );
  }
}

const mapStateToProps = state => ({
  lexon: state.lexon
});

export default connect(mapStateToProps)(Header);

// export default Header;
