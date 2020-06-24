import React, { Component } from 'react';
import { ChoiceGroup, Button } from 'office-ui-fabric-react';
import { getCompanies, base64Decode } from '../../services/services';
import Header from '../header/header';
import '../select-company/select-company.css';
import { 
  PAGE_LOGIN, 
  PAGE_MESSAGE_CLASSIFICATIONS
 } from "../../constants";

class SelectCompany extends Component {
    _isMounted = false;
    constructor(props, context) {
        super(props, context);
        this.state = {
          companies: [],
          newCompanies: [],
          selectCompany: null,
          user: null,
          isDisabled: true
        };
      }

    componentDidMount() {
      this._isMounted = true;
      const user = base64Decode();
      this.setState({ user: user })
      this.getCompanies();
    }

    getCompanies() {
      getCompanies()
      .then((result) => {
        let newCompanies = [];
        result.companies.forEach(company => {
          newCompanies.push({
            key: company.bbdd,
            text: company.name
          })
        });
        this.setState({
          newCompanies: newCompanies, 
          companies: result.companies
        });
      })
      .catch((errors) => {
        console.log(errors);
      });
    }

    componentWillUnmount() {
      this._isMounted = false;
    }

    logout = async () => { 
      localStorage.removeItem('auth-lexon');
      localStorage.removeItem('selectCompany');
      this.props.changePage(PAGE_LOGIN);
    }

    _onChange = (e, option) => {
      const { companies, isDisabled } = this.state
      companies.forEach(company => {
        if(company.bbdd == option.key) {
          this.setState({
            selectCompany: company, 
            isDisabled: false
          });
        }
      });
    }

    click = async () => {
      const { selectCompany } = this.state
      localStorage.setItem('selectCompany', JSON.stringify(selectCompany));
      if(selectCompany != null) {
        this.props.changePage(PAGE_MESSAGE_CLASSIFICATIONS, 
          selectCompany);
      }
    };

    render() {
     const { 
       newCompanies, 
       isDisabled,
       user
     } = this.state
      const options = newCompanies;
      return (
        <div className="">  
         <Header logout={this.logout} user={user} />
         <div className="form-selection-business">
           <p>Selecciona una empresa:</p>
         </div>
         <div className="select-group">
         <ChoiceGroup 
            options={options} 
            onChange={this._onChange} />
         </div>
         <div className="justify-content-center">
          <Button
             className="btn-primary"
             disabled={isDisabled}
             onClick={this.click}
           >
             Entrar
           </Button>
         </div>
        
        </div>
      );
    }
}

export default SelectCompany;