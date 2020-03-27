import React, { Component, Fragment } from 'react';
import './tab-attach-document.css';
import PropTypes from 'prop-types';
import i18n from 'i18next';
import { connect } from 'react-redux';
import Spinner from '../../spinner/spinner';
import ModalAttachDocuments from '../../modal-attach-documents/modal-attach-documents';
import ACTIONS from '../../../actions/documentsAction';

class TabAttachDocument extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
    this.onShowLoader = this.onShowLoader.bind(this);
    this.onHideLoader = this.onHideLoader.bind(this);
  }

  componentDidMount() {}

  componentWillUnmount() {
    window.removeEventListener('LoadingMessage', this.onShowLoader);
    window.removeEventListener('LoadedMessage', this.onHideLoader);
  }

  componentDidUpdate(prevProps) {}

  onShowLoader() {
    this.setState({ loading: true });
  }

  onHideLoader() {
    this.setState({ loading: false });
  }

  render() {
    const { user, toggleNotification } = this.props;

    if (this.state.loading === true) {
      return <Spinner />;
    }

    return (
      <Fragment>
        <ModalAttachDocuments
          user={user}
          updateClassifications={this.getClassifications}
          toggleNotification={toggleNotification}
        />
        <div>
          <strong>{i18n.t('tab-attachment.select-docs')}</strong>
          <p
            className='add-more-container add-more'
            onClick={this.props.toggleModalAttachDocuments}>
            <span className='lf-icon-add'></span>
            <strong>{i18n.t('tab-attachment.select-link')}</strong>
          </p>
        </div>
        <style jsx>{`
          .add-more strong {
            cursor: pointer;
            margin-right: 20px;
          }
        `}</style>
      </Fragment>
    );
  }
}

TabAttachDocument.propTypes = {
  user: PropTypes.string.isRequired
};

const mapDispatchToProps = dispatch => ({
  toggleModalAttachDocuments: () =>
    dispatch(ACTIONS.toggleModalAttachDocuments())
});

const mapStateToProps = state => {
  return {
    selectedMessages: state.email.selectedMessages,
    companySelected: state.selections.companySelected
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TabAttachDocument);
