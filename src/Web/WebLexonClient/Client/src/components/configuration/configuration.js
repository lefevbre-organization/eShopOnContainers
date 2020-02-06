import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import i18n from "i18next";
import { connect } from "react-redux";
import Switch from "react-switch";

import ACTIONS from "../../actions/selections";
import { PAGE_SELECT_ACTION } from "../../constants";
class Configuration extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showMessage: false,
      checked: false
    };

    this.handleOnClick = this.handleOnClick.bind(this);
  }

  componentDidMount() { 
  }

  handleOnClick() {
    const checked = !this.state.checked;
    this.setState({checked})
  }

  renderShowMessageSelectCompany() {
    const { showMessage } = this.state;

    if (showMessage) {
      return (
        <p className="d-flex align-items-center business-alert-warning">
          <span className="lf-icon-close-round-full"></span>
          <strong>{i18n.t("select-company.must-select-company")}</strong>
        </p>
      );
    }
  }

  render() {
    return (
      <Fragment>
        <div className="container">
          <div className="row config-title">
            <a href="#" onClick={()=>{this.props.changePage(PAGE_SELECT_ACTION)}}>
              <span
              className="icon lf-icon-arrow-left"></span>
            </a>
          <p>OPCIONES DE CONFIGURACIÓN</p>
          </div>
        </div>
        <ul>
          <li>
            <label>
              <Switch height={18} width={36} checkedIcon={false} uncheckedIcon={false} onChange={this.handleOnClick} checked={this.state.checked} />
              <span>Switch with default style</span>
              </label>
          </li>
        </ul>
      <style jsx>{`
      .config-title {
        border-bottom: 2px solid #001978;
        margin: 10px 0;
      }

      .config-title a:hover {
        background-color: #e5e8f1;
      }

      .config-title a {
        border-radius: 50%;
        width: 34px;        
        height: 34px;
        text-align: center;
        padding-top: 5px;
      }

      .config-title p {
        color: #7f8cbb;
        font-size: 12px;
        font-weight: bold;
        line-height: 32px;
        text-align: center;
        text-transform: uppercase;
        font-family: MTTMilano, Lato, Arial, sans-serif;
        margin-bottom: 0;
        margin-left: 10px;
      }

      .icon {
        font-size: 20px;
        color: #001978;
      }

      `}</style>
      </Fragment>
    );
  }
}

Configuration.propTypes = {
  user: PropTypes.string.isRequired,
  companies: PropTypes.array.isRequired,
  initialBBDD: PropTypes.object.isRequired
};

const mapStateToProps = state => {
  return {
    companySelected: state.selections.companySelected,
    errors: state.applicationReducer.errors,
    initialBBDD: state.selections.initialBBDD
  };
};

const mapDispatchToProps = dispatch => ({
  setCompanySelected: item => dispatch(ACTIONS.setCompanySelected(item))
});

export default connect(mapStateToProps, mapDispatchToProps)(Configuration);
