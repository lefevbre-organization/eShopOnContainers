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

  renderIconCheck() {
    const { resultsSelected } = this.props;  
    const { IdFile } = this.props.result;

    if (resultsSelected.map(e => e.IdFile).indexOf(IdFile) !== -1) {
      return <span className="lf-icon-check"></span>;
    } else {
      return null;
    }
  }

  render() {
    const { IdFile, Name, Description } = this.props.result;

    return (
      <tr onClick={this._handleOnClick}>
        <td>
          {this.renderIconCheck()}
          {IdFile}
        </td>
        <td>{Name}</td>
        <td>{Description}</td>
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
