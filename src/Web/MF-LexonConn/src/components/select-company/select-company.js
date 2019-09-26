import React, { Component } from "react";
import "./select-company.css";
import PropTypes from "prop-types";
import i18n from "i18next";

import Company from '../company/company'
import { PAGE_SELECT_ACTION } from "../../constants";

class SelectCompany extends Component {
  constructor(props) {
    super(props);

    this._handelOnClick = this._handelOnClick.bind(this);
  }

  _handelOnClick() {
    // const { toggleClassifyEmails } = this.props;

    // toggleClassifyEmails();

    this.props.changePage(PAGE_SELECT_ACTION);
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <form className="col-12 form-selection-business">
            <p>{i18n.t("select-company.select-company")}</p>
            <ul className="list-unstyled">
              {
                this.props.companies.map(company => {
                  return (<Company company={company} key={company.IdCompany} />);
                })
              }
            </ul>
            <div className="d-flex justify-content-center mt-5">
              <button type="button" className="btn btn-primary text-center" onClick={this._handelOnClick}>
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

SelectCompany.propTypes = {
  user: PropTypes.string.isRequired,
  companies: PropTypes.array.isRequired
};

export default SelectCompany;
