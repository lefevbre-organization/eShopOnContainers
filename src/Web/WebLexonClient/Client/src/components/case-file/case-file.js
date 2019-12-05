import React, { Component } from "react";
import PropTypes from "prop-types";
import { PAGE_SELECT_COMPANY } from "../../constants";

class CaseFile extends Component {
  constructor(props) {
    super(props);

    this.handleRemoveCaseFile = this.handleRemoveCaseFile.bind(this);
  }
  
  componentDidMount() {
    window.addEventListener("RemoveCaseFile", this.handleRemoveCaseFile);
  }

  componentWillUnmount() {
    window.removeEventListener("RemoveCaseFile", this.handleRemoveCaseFile);
  }

  handleRemoveCaseFile() {
    this.props.changePage(PAGE_SELECT_COMPANY);
  }

  render() {
    return <h3>CaseFile -> {this.props.idCaseFile}</h3>;
  }
}

CaseFile.propTypes = {
  user: PropTypes.string.isRequired,
  idCaseFile: PropTypes.string.isRequired
};

export default CaseFile;
