import React, { Component } from "react";
import PropTypes from "prop-types";

class Company extends Component {
  render() {
    const id = `optionsRadios${this.props.company.IdCompany}`;
    const value = this.props.company.IdCompany;
    const name = this.props.company.Name;
    return (
      <li>
        <input type="radio" name="optionsRadios" id={id} value={value} />
        <label htmlFor={id}>
          <strong>{name}</strong>
        </label>
      </li>
    );
  }
}

Company.propTypes = {
   company: PropTypes.object.isRequired
};

export default Company;
