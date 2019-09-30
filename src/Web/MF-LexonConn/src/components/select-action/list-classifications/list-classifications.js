import React, { Component, Fragment } from "react";
import "./list-classifications.css";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { getClassifications } from "../../../services/services-lexon";
import Classification from "../classification/classification";

class ListClassifications extends Component {
  constructor(props) {
    super(props);

    this.state = {
      classifications: []
    };

    this.getClassifications = this.getClassifications.bind(this);
  }

  componentDidMount() {
    const { selectedMessages } = this.props;

    if (selectedMessages.length === 1) {
      this.getClassifications(this.props.selectedMessages[0]);
    } else {
      this.setState({ classifications: [] });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedMessages !== prevProps.selectedMessages) {
      if (this.props.selectedMessages.length === 1) {
        this.getClassifications(this.props.selectedMessages[0]);
      } else {
        this.setState({ classifications: [] });
      }
    }
  }

  getClassifications(mailId) {
    const { user, companySelected } = this.props;

    getClassifications(user, companySelected.IdCompany, mailId)
      .then(result => {
        this.setState({
          classifications: result.classifications.Classifications.List
        });
      })
      .catch(error => {
        console.log("error ->", error);
      });
  }

  render() {
    const { classifications } = this.state;
    const { user, selectedMessages } = this.props;
    const mail = selectedMessages[0];

    return (
      <Fragment>
        <h2 className="lexon-title-list">Clasificaciones:</h2>
        <ul className="row lexon-document-list">
          {classifications.map(classification => {
            return (
              <Classification
                classification={classification}
                key={classification.Name}
                user={user}
                mail={mail}
                updateClassifications={getClassifications}
              />
            );
          })}
        </ul>
      </Fragment>
    );
  }
}

ListClassifications.propTypes = {
  user: PropTypes.string.isRequired
};

const mapStateToProps = state => {
  return {
    selectedMessages: state.email.selectedMessages,
    companySelected: state.selections.companySelected
  };
};

export default connect(mapStateToProps)(ListClassifications);
