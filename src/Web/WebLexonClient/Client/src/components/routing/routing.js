import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  PAGE_SELECT_COMPANY,
  PAGE_SELECT_ACTION,
  PAGE_CASEFILE
} from "../../constants";
import SelectCompany from "../select-company/select-company";
import CaseFile from "../case-file/case-file";
import SelectAction from "../select-action/select-action";
import { connect } from "react-redux";

class Routing extends Component {
  constructor(props) {
    super(props);

    let actualPage = PAGE_SELECT_COMPANY;
    if (props.casefile != null && props.casefile !== undefined) {
      actualPage = PAGE_CASEFILE;
    }

    this.state = {
      actualPage: actualPage
    };

    this.changePage = this.changePage.bind(this);
  }

  changePage(page) {
    this.setState({ actualPage: page });
  }

  render() {
    const { actualPage } = this.state;
    const { user, companies, toggleNotification, casefile, bbdd, company } = this.props;

    switch (actualPage) {
      case PAGE_SELECT_COMPANY:
        return (
          <SelectCompany
            user={user}
            companies={companies}
            changePage={this.changePage}
          />
        );
      case PAGE_CASEFILE:
        return (
          <CaseFile
            user={user}
            changePage={this.changePage}
            idCaseFile={casefile}
            bbdd={bbdd}
            idCompany={company}
          />
        );
      case PAGE_SELECT_ACTION:
        return (
          <SelectAction
            user={user}
            companies={companies}
            changePage={this.changePage}
            toggleNotification={toggleNotification}
          />
        );

      default:
        return <SelectCompany changePage={this.changePage} />;
    }
  }
}

Routing.propTypes = {
  user: PropTypes.string.isRequired,
  companies: PropTypes.array.isRequired,
  toggleNotification: PropTypes.func.isRequired
};

const mapStateToProps = state => {
  return {
    errors: state.applicationReducer.errors
  };
};

export default connect(mapStateToProps)(Routing);
