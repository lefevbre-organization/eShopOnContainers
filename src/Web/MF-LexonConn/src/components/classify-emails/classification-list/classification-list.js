import React, { Component } from "react";
import "./classification-list.css";
import PerfectScrollbar from "react-perfect-scrollbar";
import ClassificationListSearch from "../classification-list-search/classification-list-search";
import PropTypes from "prop-types";
import ResultsSearch from "../results-search/results-search";
import i18n from "i18next";

class ClassificationList extends Component {
  render() {
    const {
      listResultsByType,
      searchResultsByType,
      resultsSelected,
      updateResultsSelected
    } = this.props;
    const countResults = listResultsByType.length;

    return (
      <div className="lexon-clasification-list-container">
        <div className="form-group">
          <label>
            {i18n.t("classification-type.select")}<span className="requerido">*</span>
          </label>
        </div>

        <ClassificationListSearch
          searchResultsByType={searchResultsByType}
          countResults={countResults}
        />

        <table className="lexon-clasification-list">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Descripción</th>
            </tr>
          </thead>

          <tbody>
            <PerfectScrollbar>
            {listResultsByType.map(result => {
              return (
                <ResultsSearch
                  key={result.idFile}
                  result={result}
                  resultsSelected={resultsSelected}
                  updateResultsSelected={item => {
                    updateResultsSelected(item);
                  }}
                />
              );
            })}
            </PerfectScrollbar>
          </tbody>
        </table>
      </div>
    );
  }
}

ClassificationList.propTypes = {
  listResultsByType: PropTypes.array.isRequired,
  searchResultsByType: PropTypes.func.isRequired
};

export default ClassificationList;
