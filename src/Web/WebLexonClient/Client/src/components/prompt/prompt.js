import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from 'i18next';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';

class Prompt extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modal: props.initialModalState,
      text: '',
    };

    this._handleOnClick = this._handleOnClick.bind(this);
  }

  _handleOnClick(ok) {
    const { toggleConfirmRemoveClassification, onOk, onCancel } = this.props;
    const { text } = this.state;
    toggleConfirmRemoveClassification();
    if (ok) {
      onOk && onOk(text);
    } else {
      onCancel && onCancel();
    }
  }

  render() {
    const {
      title,
      placeholder,
      initialModalState,
      toggleConfirmRemoveClassification,
    } = this.props;
    const { text } = this.state;

    if (initialModalState === false) {
      return null;
    }
    return (
      <div className='prompt-container'>
        <Modal
          show={initialModalState}
          onHide={toggleConfirmRemoveClassification}
          size='m'
          aria-labelledby='contained-modal-title-vcenter'
          centered
          dialogClassName='prompt'>
          <Modal.Header className='align-items-center' closeButton>
            {title}
          </Modal.Header>
          <Modal.Body bsPrefix='modal-body info'>
            <div className='container-fluid content'>
              <div className='row d-flex justify-content-center'>
                <div className='col col-12 p-0' style={{ textAlign: 'center' }}>
                  <TextBoxComponent
                    value={text}
                    change={(event) => {
                      this.setState({ text: event.value });
                    }}
                    cssClass='e-outline'
                    placeholder={placeholder}
                  />
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer bsPrefix='modal-footer info'>
            <Button
              variant='primary-white'
              onClick={() => this._handleOnClick(false)}>
              {i18n.t('new-folder-prompt.no')}
            </Button>
            <Button
              variant='outline-secondary-white'
              onClick={() => this._handleOnClick(true)}>
              {i18n.t('new-folder-prompt.yes')}
            </Button>
          </Modal.Footer>
        </Modal>
        <style jsx>
          {`
            .prompt-container {
              position: absolute;
              background-color: rgba(0, 0, 0, 0.5);
              left: 0;
              top: -64px;
              width: 100%;
              height: calc(100% + 131px);
            }
            .prompt .modal-header .close:before {
              color: #001978 !important;
            }
            .prompt .modal-body {
              height: auto;
              background-color: white;
            }
            .prompt .modal-header,
            .prompt .modal-body.info,
            .prompt .modal-footer.info {
              color: #001978 !important;
              background-color: white !important;
              width: 499px;
            }

            .prompt .modal-header {
              margin-top: 10px;
              margin-left: 40px !important;
              width: 459px;
            }

            .prompt .e-input-group.e-control-wrapper {
              width: 400px;
            }

            .prompt .close {
              margin-right: 25px;
            }

            .prompt .modal-footer button {
              width: 165px;
              border-color: #001978;
            }
          `}
          >
        </style>
      </div>
    );
  }
}

Prompt.propTypes = {
  initialModalState: PropTypes.bool.isRequired,
  toggleNotification: PropTypes.func.isRequired,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
  title: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
};

const mapStateToProps = (state) => {
  return {
    companySelected: state.selections.companySelected,
  };
};

export default connect(mapStateToProps)(Prompt);
