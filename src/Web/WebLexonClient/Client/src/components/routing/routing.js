import React, { Component } from "react";
import PropTypes from "prop-types";
import { PAGE_SELECT_COMPANY, PAGE_SELECT_ACTION } from "../../constants";
import SelectCompany from "../select-company/select-company";
import SelectAction from "../select-action/select-action";

class Routing extends Component {
  constructor(props) {
    super(props);

    this.state = {
      actualPage: PAGE_SELECT_COMPANY
    };

    this.changePage = this.changePage.bind(this);
  }

  changePage(page) {
    this.setState({ actualPage: page });
  }

  render() {
    const { actualPage } = this.state;
    const { user, companies, toggleNotification } = this.props;

    switch (actualPage) {
      case PAGE_SELECT_COMPANY:
        return (
          <SelectCompany
            user={user}
            companies={companies}
            changePage={this.changePage}
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

export default Routing;
