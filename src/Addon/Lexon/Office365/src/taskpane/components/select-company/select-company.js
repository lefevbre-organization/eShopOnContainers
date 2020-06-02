import React, { Component } from 'react';
import Header from '../header/header';
import { PAGE_LOGIN } from "../../constants";

class SelectCompany extends Component {
    _isMounted = false;
    constructor(props, context) {
        super(props, context);
        this.state = {
        //   isLoading: false,
        };
      }

    componentDidMount() {
      this._isMounted = true;
    }

    componentWillUnmount() {
      this._isMounted = false;
    }

    logout = async () => { 
      localStorage.removeItem('auth-lexon');
      this.props.changePage(PAGE_LOGIN);
    }

    render() {
      return (
        <div className="">  
         <Header logout={this.logout} />
         <p>SelectCompany</p>
        </div>
      );
    }
}

export default SelectCompany;