import React, { Component, Fragment } from "react";
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

  renderCasefile(name, description, client) {
    return <Fragment>
      <td>
        <span className="lf-icon-check"></span>
        {name}
      </td>
      <td>{client}</td>
      <td>{description}</td>
    </Fragment>
  }

  renderPerson(description, intervening) {
    return <Fragment>
       <td>
          <span className="lf-icon-check"></span>
          {description}
        </td>
         <td>
          {intervening}
         </td>
    </Fragment>
  }

  render() {
    const { name, description, client, intervening = '' } = this.props.result;
    const classSelected = this.classSelected();

    return (
      <tr onClick={() => this._handleOnClick()} className={classSelected}>
        {this.props.selections.typeSelected === 1 && this.renderCasefile(name, description, client)}
        {this.props.selections.typeSelected !== 1 && this.renderPerson(description, intervening)}
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
