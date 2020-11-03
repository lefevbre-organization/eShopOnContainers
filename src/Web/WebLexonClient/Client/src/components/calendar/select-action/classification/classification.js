import React, { Component } from 'react';
import './classification.css';
import PropTypes from 'prop-types';
import i18n from 'i18next';
import { connect } from 'react-redux';

import { removeEventClassifications } from '../../../../services/services-lexon';

class EventClassification extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: null
    };
    this._handleOnclick = this._handleOnclick.bind(this);
  }

  _handleOnclick(classification) {
    const { toggleConfirmRemoveClassification } = this.props;
    toggleConfirmRemoveClassification(classification);

    //this.removeEventClassification()
  }

  removeEventClassification() {
    const { user,  updateClassifications, classification, companySelected } = this.props;

    removeEventClassifications(
      companySelected.bbdd,
      user,
      classification,
    )
      .then(response => {
        updateClassifications();
      })
      .catch(error => {
        console.log('error ->', error);
      });
  }

  render() {
    const { description, idActuation, entityType } = this.props.classification;

    return (
        <li className='col-xl-12 lexon-item'>
          <p>
            <strong>{i18n.t('classification.type')} </strong>
            <span>{i18n.t(`classification.entity.${entityType}`)}</span>
          </p>
          <p><strong>{i18n.t('classification.assigned')}: </strong>{description}</p>
          <p className='text-right tools-bar event-toolbar'>
            <a
                href='#/'
                title={i18n.t('classification.remove-document')}
                onClick={() => {
                  this._handleOnclick(idActuation)
                }}>
              <strong className='sr-only sr-only-focusable'>
                {i18n.t('classification.remove-document')}
              </strong>
              <span className='lf-icon-trash'></span>
            </a>
          </p>
          <style jsx>{`
            .event-toolbar {
              //margin-top: -20px;
              border-bottom: 1px dashed #001978;
            }
          `}</style>
        </li>
    );
  }
}

EventClassification.propTypes = {
  user: PropTypes.string.isRequired,
  classification: PropTypes.object.isRequired,
  updateClassifications: PropTypes.func.isRequired,
  toggleConfirmRemoveClassification: PropTypes.func.isRequired
};

const mapStateToProps = state => {
  return {
    companySelected: state.selections.companySelected
  };
};

export default connect(mapStateToProps)(EventClassification);
