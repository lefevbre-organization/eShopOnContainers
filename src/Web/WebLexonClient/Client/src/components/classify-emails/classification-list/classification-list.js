import React, { Component } from "react";
import "./classification-list.css";
import ClassificationListSearch from "../classification-list-search/classification-list-search";
import PropTypes from "prop-types";
import ResultsSearch from "../results-search/results-search";
import i18n from "i18next";
import PerfectScrollbar from "react-perfect-scrollbar";
import { connect } from "react-redux";

class ClassificationList extends Component {
  render() {
    const {
      listResultsByType,
      searchResultsByType,
      resultsSelected,
      updateResultsSelected,
      selections
    } = this.props;
    const countResults = listResultsByType.length;

    return (
      <div className="lexon-clasification-list-container">
        <div className="form-group">
          <label>
            {i18n.t("classification-list.assigned-to")}
            <span className="requerido">*</span>
          </label>
        </div>

        <ClassificationListSearch
          searchResultsByType={searchResultsByType}
          countResults={countResults}
        />

        <table className="lexon-clasification-list">
          <thead>
            <tr>
              <th>{i18n.t("classification-list.name")}</th>
              {selections.typeSelected === 1 ? (
                <th>{i18n.t("classification-list.client")}</th>
              ) : null}
              {/* <th>Nombre</th> */}
              {selections.typeSelected === 1 ? (
                <th>{i18n.t("classification-list.description")}</th>
              ) : null}
            </tr>
          </thead>
        </table>
        <PerfectScrollbar style={{ height: "250px" }}>
          <table className="lexon-clasification-list">
            <tbody>
              {listResultsByType.map(result => {
                return (
                  <ResultsSearch
                    key={result.id}
                    result={result}
                    resultsSelected={resultsSelected}
                    updateResultsSelected={item => {
                      updateResultsSelected(item.id);
                    }}
                  />
                );
              })}
            </tbody>
          </table>
        </PerfectScrollbar>
      </div>
    );
  }
}

ClassificationList.propTypes = {
  listResultsByType: PropTypes.array.isRequired,
  searchResultsByType: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  selections: state.selections
});

export default connect(mapStateToProps)(ClassificationList);
