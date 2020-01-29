import React, { Component } from "react";
import PropTypes from "prop-types";
import { PAGE_SELECT_COMPANY } from "../../constants";
import { getCasefile } from "../../services/services-lexon";
import i18n from "i18next";

class CaseFile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      caseFileSearch: null,
      caseFile: null
    };

    this.handleRemoveCaseFile = this.handleRemoveCaseFile.bind(this);
  }

  componentDidMount() {
    // console.log("user ->", this.props.user);
    // console.log("idCaseFile ->", this.props.idCaseFile);
    // console.log("bbdd ->", this.props.bbdd);
    // console.log("idCompany ->", this.props.idCompany);

    getCasefile(
      this.props.user.idUser,
      this.props.bbdd,
      this.props.idCompany,
      1,
      this.props.idCaseFile
    )
      .then(result => {
        const icase = parseInt(this.props.idCaseFile);
        for(let i = 0; i < result.results.length; i++) {
          if(result.results[i].id === icase) {
            cf = result.results[i].id;
            break;
          }
        }
        this.setState( { caseFileSearch: result.results, caseFile: cf } );
      })
      .catch(error => {
        console.log("error ->", error);
      });

    window.addEventListener("RemoveCaseFile", this.handleRemoveCaseFile);
  }

  componentWillUnmount() {
    window.removeEventListener("RemoveCaseFile", this.handleRemoveCaseFile);
  }

  handleRemoveCaseFile() {
    this.props.changePage(PAGE_SELECT_COMPANY);
  }

  render() {
    const { caseFileSearch } = this.state;

    return (
      <div class="container">
        <h2 class="lex-on-related-file-title">
          <span class="lf-icon-law"></span>
          {i18n.t("case-file.casefile-related")}
        </h2>

        <ul class="lex-on-related-file-details">
          <li>
            <strong>{i18n.t("case-file.identifier")}</strong> {this.props.idCaseFile}
          </li>
          <li>
            <strong>{i18n.t("case-file.description")}</strong> {caseFileSearch ? caseFileSearch.description : null}
          </li>
          <li>
            <strong>{i18n.t("case-file.client")}</strong>
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
