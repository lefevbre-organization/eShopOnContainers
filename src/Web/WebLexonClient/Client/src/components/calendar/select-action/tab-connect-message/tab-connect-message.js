import React, { Component, Fragment } from 'react';
import './tab-connect-message.css';
import PropTypes from 'prop-types';
import SaveDocument from '../save-document/save-document';
import i18n from 'i18next';
import { connect } from 'react-redux';
import { getEventClassifications } from '../../../../services/services-lexon';
import ListEventClassifications from '../list-classifications/list-classifications';
import ConfirmRemoveClassification from '../../../confirm-remove-classification/confirm-remove-classification';
import Spinner from '../../../../components/spinner/spinner';

class TabConnectMessage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      classifications: [],
      showClassifications: true,
      showConfirmRemoveClassification: false,
    };
    this.toggleConfirmRemoveClassification = this.toggleConfirmRemoveClassification.bind(
      this
    );
    this.getEventClassifications = this.getEventClassifications.bind(this);
  }

  componentDidMount() {
    const { selectedMessages } = this.props;

    if (selectedMessages.length > 0) {
      this.setState({ showNewClassification: true });
    } else {
      this.setState({ showNewClassification: false });
    }

    if (selectedMessages.length === 1) {
      this.getEventClassifications(selectedMessages[0].Guid);
    } else {
      this.setState({ classifications: [], showClassifications: false });
    }
  }

  componentWillUnmount() {}

  componentDidUpdate(prevProps) {
    if (this.props.selectedMessages !== prevProps.selectedMessages) {
      if (this.props.selectedMessages.length > 0) {
        this.setState({ showSaveDocument: true });
      } else {
        this.setState({ showSaveDocument: false });
      }

      if (this.props.selectedMessages.length === 1) {
        this.getClassifications(this.props.selectedMessages[0].id);
      } else {
        this.setState({ classifications: [], showClassifications: false });
      }
    }
  }

  toggleConfirmRemoveClassification(classification) {
    this.setState((state) => ({
      showConfirmRemoveClassification: !state.showConfirmRemoveClassification,
      classificationToRemove: classification,
    }));
  }

  getEventClassifications(eventId) {
    const { user, companySelected } = this.props;

    getEventClassifications(
        companySelected.bbdd,
        user.idUser,
        eventId
    )
      .then((result) => {
        this.setState({
          classifications: result.data.data,
          showClassifications: true,
        });
      })
      .catch((error) => {
        console.log('error ->', error);
      });
  }

  renderShowClassifications() {
    const { bbdd, user } = this.props;
    const { classifications } = this.state;

    if(this.state.classifications && this.state.classifications.length > 0) {
      return (
          <ListEventClassifications
              user={user.idUser}
              updateClassifications={()=> { console.log("REFRESH...") }}
              classifications={classifications}
              toggleConfirmRemoveClassification={
                this.toggleConfirmRemoveClassification
              }
          />
      );
    } else {
      return null;
    }
  }

  render() {
    const { user, toggleNotification, showSpinner } = this.props;
    const {
      showConfirmRemoveClassification,
      classificationToRemove,
    } = this.state;

    if (showSpinner === true) {
      return <Spinner />;
    }


    debugger
    return (
      <Fragment>
        <p className={"empty-text"}>{i18n.t('classification-calendar.empty')} <span>{i18n.t('classification-calendar.new-classification')}</span></p>
        <ConfirmRemoveClassification
          user={user.idUser}
          initialModalState={showConfirmRemoveClassification}
          toggleConfirmRemoveClassification={
            this.toggleConfirmRemoveClassification
          }
          classification={classificationToRemove}
          updateClassifications={this.getEventClassifications}
          toggleNotification={toggleNotification}
        />

        { this.renderShowClassifications() }

        <style jsx>{`
          .empty-text {
            font-weight: 500;
            font-family: MTTMilano-Medium, Lato, Arial, sans-serif;
            font-size: 16px;
            color: #333;
          }
          
          .empty-text span {
              color: #001978;
              font-weight: bold;
              cursor: pointer;
            }
        `}</style>
      </Fragment>
    );
  }
}

TabConnectMessage.propTypes = {
  user: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  return {
    showModalDocuments: state.documentsReducer.showModalDocuments,
    selectedMessages: state.email.selectedMessages,
    companySelected: state.selections.companySelected,
    showSpinner: state.applicationReducer.showSpinner,
  };
};

export default connect(mapStateToProps)(TabConnectMessage);
