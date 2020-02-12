import React, { Component } from "react";
import PropTypes from "prop-types";
import { PAGE_SELECT_COMPANY } from "../../constants";
import { getCasefile } from "../../services/services-lexon";
import i18n from "i18next";

class CaseFile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      caseFile: null,
      loading: true
    };

    this.handleRemoveCaseFile = this.handleRemoveCaseFile.bind(this);
  }

  async componentDidMount() {
    const url = `${window.API_GATEWAY}/api/v1/lex/Lexon/entities/getbyid`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        idType: 1,
        idEntity: this.props.idCaseFile,
        bbdd: this.props.bbdd,
        idUser: this.props.user.idUser
      })
    });
    const data = await response.json();
    this.setState({ caseFile: data.data, loading: false })

    window.addEventListener("RemoveCaseFile", this.handleRemoveCaseFile);
  }

  componentWillUnmount() {
    window.removeEventListener("RemoveCaseFile", this.handleRemoveCaseFile);
  }

  handleRemoveCaseFile() {
    this.props.changePage(PAGE_SELECT_COMPANY);
  }

  render() {
    const { caseFile, loading } = this.state;

    if(loading === true) {
      return null;
    }

    console.log("CASEFILE")
    console.log(caseFile)

    if (!caseFile || (caseFile && caseFile.id === 0)) {
      return (<div class="container">
        <h2 class="lex-on-related-file-title">
          <span class="lf-icon-law"></span>
          {i18n.t("case-file.casefile-related")}
        </h2>
        <ul class="lex-on-related-file-details">
          <li className="col-xl-12 lexon-item">
            <p>
            {i18n.t("case-file.casefile-notfound")}
            </p>
          </li>
        </ul>
      </div>)
    }

    const { name, description, intervening } = caseFile;

    return (
      <div class="container">
        <h2 class="lex-on-related-file-title">
          <span class="lf-icon-law"></span>
          {i18n.t("case-file.casefile-related")}
        </h2>

        <ul class="lex-on-related-file-details">
          <li className="col-xl-12 lexon-item">
            <p>
              <strong>{i18n.t(`classification.1`)}: </strong>
              <span>{name}</span>
            </p>
            <p>
              {description}
            </p>
            <p>
              {intervening}
            </p>
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
