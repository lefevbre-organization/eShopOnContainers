import React, { Component } from 'react';
import { ChoiceGroup, Button } from 'office-ui-fabric-react';
import { getCompanies, base64Decode } from '../../services/services';
import Header from '../header/header';
import '../select-company/select-company.css';
import { 
  PAGE_LOGIN, 
  PAGE_MESSAGE_CLASSIFICATIONS,
  PAGE_DOCUMENT_ATTACHED
} from "../../constants";

class SelectCompany extends Component {
    _isMounted = false;
    constructor(props, context) {
        super(props, context);
        this.state = {
          companies: [],
          newCompanies: [],
          selectCompany: null,
          user: null
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
        this._onChange(null, newCompanies[0]);
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
      const { companies } = this.state
      companies.forEach(company => {
        if(company.bbdd == option.key) {
          this.setState({
            selectCompany: company
          });
        }
      });
    }

    click = async () => {
      const { selectCompany } = this.state
      selectCompany.conversationId = Office.context.mailbox.initialData.conversationId;
      localStorage.setItem('selectCompany', JSON.stringify(selectCompany));
       if(Office.context.mailbox.initialData.conversationId) {
          this.props.changePage(PAGE_MESSAGE_CLASSIFICATIONS, 
            selectCompany);
        } else {
          this.props.changePage(PAGE_DOCUMENT_ATTACHED, 
            selectCompany);
        }
    };

    render() {
     const { 
       newCompanies, 
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
           {options.length > 0 ? 
            <ChoiceGroup 
            defaultSelectedKey={options[0].key}
            options={options} 
            onChange={this._onChange}
            />
            : null 
          }
         
         </div>
         <div className="justify-content-center">
          <Button
             className="btn-primary"
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