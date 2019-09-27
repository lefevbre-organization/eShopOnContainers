import React, { Component } from "react";
import PropTypes from "prop-types";

class Company extends Component {
  constructor(props) {
    super(props);


    this.toggle = this.toggle.bind(this);
  }

  toggle(event) {
    const { target } = event;
    this.props.updateSelectedCompany(target.value);
  }

  render() {
    const id = `optionsRadios${this.props.company.IdCompany}`;
    const value = this.props.company.IdCompany;
    const name = this.props.company.Name;
    const { checked } = this.props;

    if (checked) {
      return (
        <li>
          <input type="radio" name="optionsRadios" id={id} value={value} onClick={this.toggle.bind(this)} checked/>
          <label htmlFor={id}>
            <strong>{name}</strong>
          </label>
        </li>
      );  
    } else {
      return (
        <li>
          <input type="radio" name="optionsRadios" id={id} value={value} onClick={this.toggle.bind(this)} />
          <label htmlFor={id}>
            <strong>{name}</strong>
          </label>
        </li>
      );  
    }
  }
}

Company.propTypes = {
   company: PropTypes.object.isRequired
};

export default Company;
