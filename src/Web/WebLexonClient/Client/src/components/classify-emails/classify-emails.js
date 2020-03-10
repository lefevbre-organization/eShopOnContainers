import React, { Fragment, Component } from 'react';
import { Button, Modal, Container } from 'react-bootstrap';
import i18n from 'i18next';
import ClassificationType from './classification-type/classification-type';
import ClassificationList from './classification-list/classification-list';
import PropTypes from 'prop-types';
import { getResults, addClassification } from '../../services/services-lexon';
import { connect } from 'react-redux';
import APPLICATION_ACTIONS from '../../actions/applicationAction';

class ClassifyEmails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modal: props.initialModalState,
      listResultsByType: [],
      resultsSelected: [],
      type: null,
      search: '',
      forceUpdate: null,
      isLoading: false
    };

    this._handleOnClick = this._handleOnClick.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.state.type &&
      (prevState.type !== this.state.type ||
        prevState.forceUpdate !== this.state.forceUpdate ||
        prevState.search !== this.state.search)
    ) {
      this.getListResultsByType();
    }

    if (
      prevProps.initialModalState !== this.props.initialModalState &&
      this.props.initialModalState === false
    ) {
      this.setState({ listResultsByType: [], resultsSelected: [] });
    }
  }

  _handleOnClick(fromSave) {
    const _this = this;

    const { type, resultsSelected } = this.state;
    const {
      user,
      companySelected,
      toggleClassifyEmails,
      selectedMessages,
      toggleNotification
    } = this.props;

    if (fromSave === true) {
      if (type === null || resultsSelected.length === 0) {
        toggleNotification(
          i18n.t('classify-emails.classification-selection-ko')
        );
        return;
      }

      toggleClassifyEmails();

      addClassification(
        user,
        companySelected,
        selectedMessages,
        resultsSelected[0],
        type
      )
        .then(() => {
          if (selectedMessages.length === 1) {
            _this.updateResultsSelected(selectedMessages[0].id);
          }
          toggleNotification(i18n.t('classify-emails.classification-saved-ok'));
        })
        .catch(error => {
          toggleNotification(
            i18n.t('classify-emails.classification-saved-ko'),
            true
          );
          console.log('error ->', error);
        });
    } else {
      toggleClassifyEmails();
    }

    this.setState({ type: null, search: '' });
  }

  getListResultsByType() {
    const { type, search } = this.state;
    const { user, companySelected } = this.props;

    if (type == null) {
      return;
    }

    this.setState({ isLoading: true });
    getResults(user, companySelected, type, search)
      .then(result => {
        this.setState({
          isLoading: false,
          listResultsByType: result.results.data
        });

        if (result.errors !== undefined && Array.isArray(result.errors)) {
          result.errors.forEach(error =>
            this.props.addError(JSON.stringify(error))
          );
        }
      })
      .catch(errors => {
        if (Array.isArray(errors)) {
          errors.forEach(error => this.props.addError(JSON.stringify(error)));
        } else {
          this.props.addError(JSON.stringify(errors));
        }
        console.log('error ->', errors);
        this.setState({
          isLoading: false,
          listResultsByType: []
        });
      });
  }

  searchResultsByType(type, search) {
    this.clearResultsSelected();

    if (type) {
      if (this.state.type === type) {
        const uuidv1 = require('uuid/v1');
        this.setState({
          forceUpdate: uuidv1()
        });
      } else {
        this.setState({
          type: type
        });
      }
    }

    if (search != null) {
      this.setState({
        search: search
      });
    }
  }

  clearResultsSelected() {
    const { updateClassifications } = this.props;

    this.setState({ resultsSelected: [] });
    //updateClassifications([]);
  }

  updateResultsSelected(item) {
    const { updateClassifications } = this.props;
    let resultsSelected = [];
    resultsSelected.push(item);

    this.setState({ resultsSelected: resultsSelected });
    updateClassifications(item);
  }

  render() {
    const { listResultsByType, resultsSelected } = this.state;
    const { initialModalState } = this.props;

    return (
      <Fragment>
        <div>
          <Modal
            show={initialModalState}
            onHide={() => {
              this._handleOnClick(false);
            }}
            size='lg'
            aria-labelledby='contained-modal-title-vcenter'
            centered
            dialogClassName='modal'
          >
            <Modal.Header className='align-items-center' closeButton>
              <Modal.Title>
                <div className='modal-title h4'>
                  <h5
                    className='modal-title d-flex align-items-center'
                    id='clasificarNuevaclasificacionLabel'
                  >
                    <span className='lf-icon-bookmarks'></span>
                    {i18n.t('classify-emails.title')}
                  </h5>
                </div>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Container>
                <p>
                  <strong>{i18n.t('classify-emails.body')}</strong>
                </p>
                <ClassificationType
                  searchResultsByType={(type, search) => {
                    this.searchResultsByType(type, search);
                  }}
                />
                <ClassificationList
                  isLoading={this.state.isLoading}
                  resultsSelected={resultsSelected}
                  listResultsByType={listResultsByType}
                  searchResultsByType={(type, search) => {
                    this.searchResultsByType(type, search);
                  }}
                  updateResultsSelected={item => {
                    this.updateResultsSelected(item);
                  }}
                />
              </Container>
            </Modal.Body>
            <Modal.Footer>
              <Button
                bsPrefix='btn btn-outline-primary'
                onClick={() => this._handleOnClick(false)}
              >
                {i18n.t('classify-emails.cancel')}
              </Button>
              <Button
                bsPrefix='btn btn-secundary'
                onClick={() => this._handleOnClick(true)}
              >
                {i18n.t('classify-emails.save')}
              </Button>
            </Modal.Footer>
          </Modal>
        </div>

        <style jsx>{`
          .container p {
            color: #001978;
          }

          .btn-secundary {
            min-width: 165px;
            border-radius: 0;
            border: 2px solid #001978;
            background-color: #001978;
            text-transform: uppercase;
            font-size: 13px;
            font-family: MTTMilano-Bold, Lato, Arial, sans-serif;
            letter-spacing: 0.7px;
            color: #ffff;
            padding: 10px;
          }

          .btn-secundary:focus {
            background-color: #001978 !important;
            border: 2px solid #001978 !important;
            color: #ffff !important;
          }

          strong {
            font-weight: 500;
            font-family: MTTMilano-Medium, Lato, Arial, sans-serif;
          }

          table {
            color: #7c868c;
          }

          .modal-dialog {
            margin-top: 6rem;
          }

          .modal-content {
            border: 0;
            border-radius: 0;
          }

          .modal-header {
            border: 0;
            background-color: #001978;
            color: #fff;
            font-size: 22px;
            border-radius: 0;
          }

          .modal .modal-dialog .modal-content .modal-header:not(.infoModal) {
            min-height: 64px;
            padding: 0 50px;
          }

          .modal-header h5 span {
            font-size: 28px;
            margin-right: 15px;
          }
          .modal-header .modal-title {
            font-size: 22px;
          }
          .modal-header .close {
            font-family: MTTMilano, Lato, Arial, sans-serif;
            opacity: 1;
            color: #fff;
            font-size: 16px;
            text-shadow: 0 0 0;
          }

          .modal-header .close:before {
            content: '\\e938';
            color: #fff;
            font-family: 'lf-font' !important;
            speak: none;
            font-style: normal;
            font-weight: normal;
            font-variant: normal;
            text-transform: none;
            line-height: 1;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          .modal-header .close span:first-child {
            color: #001978;
            display: none;
          }
          .modal-body {
            background-color: #ffffff;
          }

          .modal-body.info {
            background-color: #001978;
          }

          .modal-body.info .content {
            color: #fff;
            font-size: 19px;
          }

          .modal-body.info .content [class^='lf-icon'] {
            font-size: 100px;
            margin-right: 50px;
          }

          .modal-footer {
            border: 0;
            border-radius: 0;
            justify-content: flex-end !important;
            background-color: #ffffff;
          }
          .modal-footer.info {
            background-color: #001978;
          }

          .modal-footer .btn-primary,
          .modal-footer .btn-primary:hover {
            margin-left: 10px;
          }

          .form-group .requerido {
            color: #d81f2a;
            font-size: 20px;
            text-align: start;
          }

          .lexon-select-like-custom-trigger {
            height: 45px;
            width: 350px;
            border: 1px solid #d2d2d2;
            background-color: #ffffff;
            outline: none;
            color: #7c868c;
            font-size: 15px;
            text-align: left;
            position: relative;
            padding-left: 10px;
          }
          .lexon-select-like-custom-trigger:focus {
            outline: none;
          }
          .lexon-select-like-custom-trigger span {
            font-size: 20px;
            position: absolute;
            top: 10px;
            right: 10px;
            color: #001978;
            transition: all 0.5s ease;
          }
          .lexon-select-like-custom-trigger.opened span {
            -moz-transform: rotate(180deg);
            -webkit-transform: rotate(180deg);
            -o-transform: rotate(180deg);
            -ms-transform: rotate(180deg);
            transform: rotate(180deg);
          }
          .lexon-select-like-custom-list-container {
            transition: all 0.5s ease;
            height: 0;
            width: 350px;
            position: absolute;
            z-index: 2;
            overflow: hidden;
          }
          .lexon-select-like-custom-list-container.opened {
            height: 230px;
            overflow: visible;
          }
          .lexon-select-like-custom-list {
            height: 230px;
            width: 350px;
            border: 1px solid #d2d2d2;
            background-color: #ffffff;
            box-shadow: 0 0 4px 1px rgba(102, 175, 233, 0.6);
            position: absolute;
            z-index: 1;
            padding: 5px;
            overflow: scroll;
          }
          .lexon-select-like-custom-list li {
            border-bottom: solid 1px #001978;
            height: 43px;
            color: #7c868c;
            font-size: 15px;
            line-height: 43px;
            padding: 0 10px;
            margin: 0 2px;
          }
          .lexon-select-like-custom-list li:last-child {
            border-bottom: none;
          }
          .lexon-select-like-custom-list li span {
            color: #7c868c;
          }
          .lexon-select-like-custom-list li.selected,
          .lexon-select-like-custom-list li:hover {
            background-color: #e5e8f1;
            color: #001978;
            cursor: pointer;
          }
          .lexon-select-like-custom-list li.selected span,
          .lexon-select-like-custom-list li:hover span {
            color: #001978;
          }

          .lexon-clasification-list-container {
            border: 1px solid #d2d2d2;
            position: relative;
            z-index: 1;
          }
          .lexon-clasification-list-container label {
            line-height: 45px;
          }
          .lexon-clasification-list-search {
            position: absolute;
            top: 0;
            right: -1px;
            display: inline-block;
          }
          .lexon-clasification-list-search .lexon-clasification-list-results {
            position: relative;
            height: 45px;
            width: 190px;
            float: left;
            padding-top: 5px;
          }
          .lexon-clasification-list-search p {
            color: #001978;
            font-size: 10px;
            display: inline-block;
            padding: 5px 10px;
            margin-bottom: 0;
          }
          .lexon-clasification-list-search p strong {
            font-size: 13px;
          }
          .lexon-clasification-list-search a.search-trigger-show {
            font-size: 20px;
            color: #001978;
            font-weight: bold !important;
            display: inline-block;
            width: 30px;
            height: 30px;
            padding: 4px;
            transition: background-color 0.5ms;
            border-radius: 50%;
          }
          .lexon-clasification-list-search a.search-trigger:hover {
            background-color: #001978;
            color: #e5e8f1;
          }
          .lexon-clasification-list-searcher {
            width: 0;
            transition: all 0.5s ease;
            display: inline-block;
            height: 45px;
            background-color: #e5e8f1;
            -webkit-border-radius: 50px 0 0 50px;
            border-radius: 50px 0 0 50px;
            line-height: 35px;
            float: right;
            overflow: hidden;
          }
          .lexon-clasification-list-searcher.opened {
            width: 317px;
          }
          .lexon-clasification-list-searcher label {
            float: left;
            font-size: 20px;
            margin: 8px 10px 0 10px;
            line-height: inherit;
          }
          .lexon-clasification-list-searcher input {
            float: left;
            width: 235px;
            background-color: transparent;
            border: none;
            color: #001978;
            font-weight: bold;
            margin-top: 5px;
          }
          .lexon-clasification-list-searcher a {
            float: right;
            font-size: 12px;
            color: #001978;
            font-weight: bold !important;
            display: inline-block;
            width: 25px;
            height: 25px;
            padding: 5px 7px;
            transition: background-color 0.5ms;
            border-radius: 50%;
            line-height: 18px;
            margin: 9px 5px;
          }
          .lexon-clasification-list-searcher a:hover {
            background-color: #001978;
            color: #e5e8f1;
          }
          .lexon-clasification-list-container table {
            width: 99%;
            margin: 5px;
          }
          .lexon-clasification-list-container table thead {
            border-bottom: 1px solid #001978;
            color: #001978;
            font-size: 13px;
            font-weight: bold;
          }
          .lexon-clasification-list-container table tbody {
            height: 340px;
            display: block;
            width: 99%;
            margin: 5px;
          }
          .lexon-clasification-list-container table tbody tr {
            border-bottom: 1px solid #d2d2d2;
          }

          .lexon-clasification-list-container tr {
            display: table;
            width: 100%;
            box-sizing: border-box;
          }
          .lexon-clasification-list-container table th,
          .lexon-clasification-list-container table td {
            padding: 12px;
          }
          .lexon-clasification-list-container table tr th:nth-child(1),
          .lexon-clasification-list-container table tr td:nth-child(1) {
            width: 25%;
          }
          .lexon-clasification-list-container table tr th:nth-child(2),
          .lexon-clasification-list-container table tr td:nth-child(2) {
            width: 25%;
          }
          .lexon-clasification-list-container table tr th:nth-child(3),
          .lexon-clasification-list-container table tr td:nth-child(3) {
            width: 50%;
          }
          .lexon-clasification-list-container table td span {
            display: inline-block;
            width: 25px;
            height: 25px;
            padding: 6px;
            transition: background-color 0.3ms;
            border-radius: 50%;
            margin-right: 5px;
          }
          .lexon-clasification-list-container table tr.selected td span {
            color: #001978;
          }
          .lexon-clasification-list-container table tr.selected td span {
            background-color: #001978;
            color: #e5e8f1;
          }
          .lexon-clasification-list-container table tbody tr.selected,
          .lexon-clasification-list-container table tbody tr:hover {
            background-color: #e5e8f1;
            cursor: pointer;
            color: #001978;
          }

          @media (max-width: 374px) {
            .modal-footer {
              justify-content: space-between !important;
            }
          }

          @media (max-width: 767px) {
            .modal .modal-dialog .modal-content .modal-header:not(.infoModal) {
              padding: 1rem;
            }
            .modal-body {
              padding: 1rem;
            }
          }

          @media (min-width: 768px) {
            .modal-footer,
            .modal-body {
              padding: 1rem 50px;
            }
          }

          @media (max-height: 570px) {
            .modal-dialog {
              margin-top: 3.5rem;
            }
          }

          @media (min-width: 992px) {
            .modal-lg,
            .modal-xl {
              max-width: 900px;
            }
          }
        `}</style>
      </Fragment>
    );
  }
}

ClassifyEmails.propTypes = {
  user: PropTypes.string.isRequired,
  initialModalState: PropTypes.bool.isRequired,
  toggleClassifyEmails: PropTypes.func.isRequired,
  updateClassifications: PropTypes.func.isRequired,
  toggleNotification: PropTypes.func.isRequired
};

const mapStateToProps = state => {
  return {
    companySelected: state.selections.companySelected,
    selectedMessages: state.email.selectedMessages
  };
};

const mapDispatchToProps = dispatch => ({
  addError: error => dispatch(APPLICATION_ACTIONS.addError(error))
});

export default connect(mapStateToProps, mapDispatchToProps)(ClassifyEmails);
