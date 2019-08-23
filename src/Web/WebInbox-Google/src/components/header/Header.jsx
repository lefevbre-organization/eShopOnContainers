import React, { PureComponent } from "react";
import "./header.scss";
//import Signout from "../signout/Signout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import debounce from "lodash/debounce";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { signOut } from "../../api/authentication";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import { 
    config, 
    PROVIDER
} from "../../constants";
import { storeUser } from "../../actions/settings.actions";

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
            dropdownMenuOpen: false,
        };
    }

    _handleOnClick(e) {
        signOut();

        const userId = this.props.userId;
        if (userId !== '' && userId !== undefined) {            
            const url = `${config.url.URL_DELETE_ACCOUNT}`;
            fetch(url, {
                method:'POST',
                body: JSON.stringify({
                    user: userId,
                    provider: PROVIDER,
                    email:  this.props.googleUser.w3.U3                        
                }),
                headers: { 'Content-type': 'application/json' }
            })
            .then(r => r.json())
            .then(result => {
                console.log(result);
            });

            const urlRedirect = `${config.url.URL_SELECT_ACCOUNT}/user/${userId}/encrypt/0`;
            window.open(urlRedirect, '_self');          
        }
    }

    toggle() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen,
        });
    }

    toggleMenu() {
        this.setState({
            dropdownMenuOpen: !this.state.dropdownMenuOpen,
        });
    }

    handleSearchClick(evt) {
        if (this.props.searhQuery !== "") {
            this.performSearch();
        }
    }

    handleInputChange(evt) {
        this.props.setSearchQuery(evt.target.value);
        this.performSearch();
    }

    performSearch() {
        const searchParams = {}
        if (!this.props.searchQuery || this.props.searchQuery === "") {
            searchParams.labelIds = ["INBOX"];
        }
        this.props.getLabelMessages({ ...searchParams })
    }

    render() {
        const userInfo = this.props.googleUser.w3;
        const email = userInfo.U3;
        const fullName = userInfo.ig;
        const picUrl = userInfo.Paa;

        return (
            <header className="d-flex p-3 align-content-center align-items-center header ">
                <div className="justify-content-left">
                    <Link to="/inbox"><img border="0" alt="lefebvre" src="assets/img/lefebvre-logo.png"></img></Link>
                </div>
                <div className="header-logo justify-content-center">
                    {/*<Link to="/inbox"><img border="0" alt="gmail" src="assets/img/logo-elderecho.png"></img></Link>*/}
                    <Link to="/inbox"><img className="logo-ext" border="0" alt="otulook" src="assets/img/gmail.png"></img></Link>      
                </div>
                <div className="header-search">
                    <div className="input-group w-75 ml-1 mr-auto">
                        <input
                            type="search"
                            className="form-control search"
                            placeholder="Search mail"
                            value={this.props.searchQuery}
                            onChange={this.handleInputChange}
                        />
                        <div className="input-group-append" onClick={this.handleSearchClick}>
                            <button
                                className="btn btn-light  bg-white text-dark btn-search"
                                type="button"
                            >
                                <FontAwesomeIcon icon={faSearch} />
                            </button>
                        </div>
                    </div>
                    {/*<div className="header-logo justify-content-center">
                        <Link to="/inbox"><img className="logo-ext" border="0" alt="otulook" src="assets/img/gmail.png"></img></Link>                       
                    </div>*/}
                    <div>
                        <Nav className="ml-auto" navbar>
                            <NavItem className="d-md-down-none">
                                <NavLink href="#"><i className="icon-location-pin"></i></NavLink>
                            </NavItem>
                            <Dropdown nav isOpen={this.state.dropdownMenuOpen} toggle={this.toggleMenu}>
                                <DropdownToggle nav>
                                    <img className="img-menu" src="assets/img/menu.png" alt="" />
                                </DropdownToggle>
                                <DropdownMenu right>                                   
                                    <DropdownItem><i className="fa fa-shield"></i> Calendar</DropdownItem>
                                    <DropdownItem><i className="fa fa-shield"></i> File Manager</DropdownItem>
                                    <DropdownItem><i className="fa fa-shield"></i><span onClick={this._handleOnClick}> Configure New Account</span></DropdownItem>
                                    <DropdownItem divider />
                                    <DropdownItem><i className="fa fa-lock"></i> Return to Lex-on</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </Nav>
                    </div>   
                    <div>
                        <Nav className="ml-auto" navbar>
                            <NavItem className="d-md-down-none">
                                <NavLink href="#"><i className="icon-location-pin"></i></NavLink>
                            </NavItem>
                            <Dropdown nav isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                                <DropdownToggle nav>
                                    <img className="mx-2 profile-pic img-circle" src={picUrl} alt="" />
                                </DropdownToggle>
                                <DropdownMenu right>
                                    <DropdownItem header tag="div" className="text-center"><strong title={email}>{fullName}</strong></DropdownItem>
                                    <DropdownItem divider />
                                    <DropdownItem><i className="fa fa-shield"></i> Add Account</DropdownItem>
                                    <DropdownItem><i className="fa fa-shield"></i> Create Account</DropdownItem>
                                    <DropdownItem divider />
                                    <DropdownItem onClick={this.props.onSignout}><i className="fa fa-lock"></i> Logout</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </Nav>
                    </div> 
                </div>                
            </header>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        userId: state.storeUser.userId
    }    
};  

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      storeUser
    },
    dispatch
);

export default connect(mapStateToProps, mapDispatchToProps)(Header)

// export default Header;
