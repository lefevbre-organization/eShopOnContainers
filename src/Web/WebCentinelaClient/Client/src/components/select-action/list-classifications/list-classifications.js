import React, { Component, Fragment } from 'react';
import './list-classifications.css';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import Classification from '../classification/classification';
import i18n from 'i18next';

class ListClassifications extends Component {
  constructor(props) {
    super(props);

    this.renderNoClassifications = this.renderNoClassifications.bind(this);
  }

  renderNoClassifications() {
    const { classifications } = this.props;

    if (
      (classifications &&
        Array.isArray(classifications) &&
        classifications.length === 0) ||
      !classifications
    ) {
      return (
        <div>
          <strong>
            <strong>{i18n.t('list-classifications.no-classifications')}</strong>
          </strong>
        </div>
      );
    } else {
      return null;
    }
  }

  render() {
    const {
      user,
      selectedMessages,
      classifications,
      updateClassifications,
      toggleConfirmRemoveClassification
    } = this.props;
    const mail = selectedMessages[0];

    if (selectedMessages.length > 1) {
      return null;
    }

    const classificationsFiltered = [...new Set(classifications)];

    const uuidv1 = require('uuid/v1');

    return (
      <Fragment>
        <h2 className='lexon-title-list'>
          {i18n.t('list-classifications.classifications')}
        </h2>

        {this.renderNoClassifications()}

        <div id='scrl-container'>
          <PerfectScrollbar options={{ suppressScrollX: true }}>
            <ul className='row lexon-document-list'>
              {classificationsFiltered &&
                classificationsFiltered.map(classification => {
                  return (
                    <Classification
                      classification={classification}
                      key={uuidv1()}
                      user={user}
                      mail={mail}
                      updateClassifications={updateClassifications}
                      toggleConfirmRemoveClassification={
                        toggleConfirmRemoveClassification
                      }
                    />
                  );
                })}
            </ul>
          </PerfectScrollbar>
        </div>
        <style jsx>{`
          #scrl-container .scrollbar-container {
            position: absolute !important;
            top: 350px !important;
            bottom: 0 !important;
            height: unset !important;
          }
        `}</style>
      </Fragment>
    );
  }
}

ListClassifications.propTypes = {
  user: PropTypes.string.isRequired,
  toggleConfirmRemoveClassification: PropTypes.func.isRequired
};

const mapStateToProps = state => {
  return {
    selectedMessages: state.email.selectedMessages,
    companySelected: state.selections.companySelected
  };
};

export default connect(mapStateToProps)(ListClassifications);
