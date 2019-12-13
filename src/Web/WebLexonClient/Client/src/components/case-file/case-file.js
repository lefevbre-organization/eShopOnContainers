import React, { Component } from "react";
import PropTypes from "prop-types";
import { PAGE_SELECT_COMPANY } from "../../constants";

class CaseFile extends Component {
  constructor(props) {
    super(props);

    this.handleRemoveCaseFile = this.handleRemoveCaseFile.bind(this);
  }
  
  componentDidMount() {
    console.log("idCaseFile ->", this.props.idCaseFile);
    console.log("bbdd ->", this.props.bbdd);
    console.log("idCompany ->", this.props.idCompany);
    window.addEventListener("RemoveCaseFile", this.handleRemoveCaseFile);
  }

  componentWillUnmount() {
    window.removeEventListener("RemoveCaseFile", this.handleRemoveCaseFile);
  }

  handleRemoveCaseFile() {
    this.props.changePage(PAGE_SELECT_COMPANY);
  }

  render() {
    return (
      <div class="container">

            <h2 class="lex-on-related-file-title">
                <span class="lf-icon-law"></span>
                Expediente relacionado
            </h2>

            <ul class="lex-on-related-file-details">
                <li>
                    <strong>Identificador:</strong> {this.props.idCaseFile}
                </li>
                <li>
                    <strong>Descripción:</strong> Reclamación Seguros OCASO por accidente múltiple
                </li>
                <li>
                    <strong>Cliente:</strong> Construcciones Gorbeia, S.L.
                </li>
            </ul>

        </div>
    );
  }
}

CaseFile.propTypes = {
  user: PropTypes.string.isRequired,
  idCaseFile: PropTypes.string.isRequired,
  bbdd: PropTypes.string.isRequired,
  idCompany: PropTypes.string.isRequired
};

export default CaseFile;
