import React, { Component } from "react";
import "./select-company.css";
import PropTypes from "prop-types";
import i18n from "i18next";
import { connect } from "react-redux";
import ACTIONS from "../../actions/selections";

import Company from "../company/company";
import { PAGE_SELECT_ACTION } from "../../constants";

class SelectCompany extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showMessageSelectCompany: false
    };

    this._handleOnClick = this._handleOnClick.bind(this);
    this.updateSelectedCompany = this.updateSelectedCompany.bind(this);
  }

  componentDidMount() {
    const { companies } = this.props;
    if (companies.length === 1) {
      this.props.setCompanySelected(companies[0]);
      this.props.changePage(PAGE_SELECT_ACTION);
    }
  }

  _handleOnClick() {
    // const { toggleClassifyEmails } = this.props;

    // toggleClassifyEmails();

    const { companySelected } = this.props;
    if (companySelected) {
      this.setState({ showMessageSelectCompany: false });
      this.props.changePage(PAGE_SELECT_ACTION);
    } else {
      this.setState({ showMessageSelectCompany: true });
    }
  }

  updateSelectedCompany(idCompany) {
    const company = this.props.companies.find(
      company => company.idCompany === Number(idCompany)
    );
    this.props.setCompanySelected(company);
    this.setState({
      showMessageSelectCompany: false
    });
  }

  renderShowMessageSelectCompany() {
    const { showMessageSelectCompany } = this.state;

    if (showMessageSelectCompany) {
      return (
        <p className="d-flex align-items-center business-alert-warning">
          <span className="lf-icon-close-round-full"></span>
          <strong>{i18n.t("select-company.must-select-company")}</strong>
        </p>
      );
    }
  }

  renderCompany(company) {
    const { companySelected } = this.props;

    if (
      companySelected == null ||
      companySelected.idCompany !== Number(company.idCompany)
    ) {
      return (
        <Company
          company={company}
          key={company.idCompany}
          updateSelectedCompany={this.updateSelectedCompany}
          checked={false}
        />
      );
    } else {
      return (
        <Company
          company={company}
          key={company.idCompany}
          updateSelectedCompany={this.updateSelectedCompany}
          checked={true}
        />
      );
    }
  }

  render() {
    const _this = this;

    return (
      <div className="container">
        <div className="row">
          <form className="col-12 form-selection-business">
            <p>{i18n.t("select-company.select-company")}</p>
            <ul className="list-unstyled">
              {this.props.companies.map(company => {
                return _this.renderCompany(company);
              })}
            </ul>
            {this.renderShowMessageSelectCompany()}
            <div className="d-flex justify-content-center mt-5">
              <button
                type="button"
                className="btn btn-primary text-center"
                onClick={this._handleOnClick}
              >
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

const mapStateToProps = state => {
  return {
    companySelected: state.selections.companySelected,
    errors: state.applicationReducer.errors
  };
};

const mapDispatchToProps = dispatch => ({
  setCompanySelected: item => dispatch(ACTIONS.setCompanySelected(item))
});

export default connect(mapStateToProps, mapDispatchToProps)(SelectCompany);
