import React, { Component } from "react";
import "./results-search.css";
import PropTypes from "prop-types";
import { connect } from "react-redux";

class ResultsSearch extends Component {
  constructor(props) {
    super(props);

    this.state = {
      classSelected: ""
    };

    this._handleOnClick = this._handleOnClick.bind(this);
  }

  _handleOnClick() {
    const { updateResultsSelected, result } = this.props;

    updateResultsSelected(result);
    this.setState({ classSelected: this.classSelected() });
  }

  classSelected() {
    const { resultsSelected } = this.props;
    const { id } = this.props.result;

    return resultsSelected.indexOf(id) !== -1 ? "selected" : "";
  }

  render() {
    const { name, description, client } = this.props.result;
    const classSelected = this.classSelected();

    return (
      <tr onClick={() => this._handleOnClick()} className={classSelected}>
        <td>
          <span className="lf-icon-check"></span>
          {name}
        </td>
        {this.props.selections.typeSelected === 1 ? <td>{client}</td> : null}
        {/* <td>{name}</td> */}
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

const mapStateToProps = state => ({
  selections: state.selections
});

export default connect(mapStateToProps)(ResultsSearch);
