import React, { Component } from "react";
import "./results-search.css";
import PropTypes from "prop-types";

class ResultsSearch extends Component {
  constructor(props) {
    super(props);

    this._handleOnClick = this._handleOnClick.bind(this);
  }

  _handleOnClick() {
    const { updateResultsSelected, result } = this.props;

    updateResultsSelected(result);
  }

  classSelected() {
    const { resultsSelected } = this.props;
    const { idFile } = this.props.result;

    if (resultsSelected.map(e => e.idFile).indexOf(idFile) !== -1) {
      return "selected";
    } else {
      return "";
    }
  }

  render() {
    const { idFile, name, description } = this.props.result;
    const classSelected = this.classSelected();

    return (
      <tr onClick={this._handleOnClick} className={classSelected}>
        <td>
          <span className="lf-icon-check"></span>
          {idFile}
        </td>
        <td>{name}</td>
        <td>{description}</td>
      </tr>
    );
  }
}

ResultsSearch.propTypes = {
  result: PropTypes.object.isRequired,
  resultsSelected: PropTypes.array.isRequired,
  updateResultsSelected: PropTypes.func.isRequired
};

export default ResultsSearch;
