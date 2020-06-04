import React, { Component } from 'react';
import { ChoiceGroup, Button } from 'office-ui-fabric-react';
import { getCompanies } from '../../services/services';
import Header from '../header/header';
import '../select-company/select-company.css';
import { PAGE_LOGIN } from "../../constants";

class SelectCompany extends Component {
    _isMounted = false;
    constructor(props, context) {
        super(props, context);
        this.state = {
          companies: [],
        };
      }

    componentDidMount() {
      this._isMounted = true;
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
        this.setState({companies: newCompanies});
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
      this.props.changePage(PAGE_LOGIN);
    }

    _onChange(e) {
      console.log(e.target)
    }

    render() {
     const { companies } = this.state
      const options = companies;
      return (
        <div className="">  
         <Header logout={this.logout} />
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
             // buttonType={ButtonType.hero}
             // iconProps={{ iconName: "ChevronRight" }}
             // onClick={this.click}
           >
             Entrar
           </Button>
         </div>
        
        </div>
      );
    }
}

export default SelectCompany;