import React, { Component } from 'react';
import './progress.css';
import { Modal } from 'react-bootstrap';
import {
  ProgressBarComponent,
  ILoadedEventArgs,
  ProgressTheme
} from '@syncfusion/ej2-react-progressbar';
import { EmitType } from '@syncfusion/ej2-base';

interface Props {
  initialModalState: boolean;
  toggleProgress: (message?: string, error?: boolean) => void;
  message?: string;
}


class Progress extends Component<Props> {
  render() {
    const {
      initialModalState,
      toggleProgress,
      message,
    } = this.props;

    return (
      <Modal
        show={initialModalState}
        onHide={toggleProgress}
        size='lg'
        backdrop={"static"}
        aria-labelledby='contained-modal-title-vcenter'
        centered
        dialogClassName='modal notification'
        animation={false}>
        <Modal.Header className='align-items-center'>
          <Modal.Title>
            <div className='modal-title h4' style={{display: 'flex', alignItems: 'center'}}>
              <ProgressBarComponent id="rounded-container"
                                    type='Circular'
                                    width='80px'
                                    height='80px'
                                    cornerRadius='Round'
                                    isIndeterminate={true}
                                    value={20}
                                    animation={{
                                      enable: true,
                                      duration: 2000,
                                      delay: 0,
                                    }}
                                    //load={this.progressLoad.bind(this)}
              >
              </ProgressBarComponent>
              <h5
                className='modal-title d-flex align-items-center'
                id='clasificarNuevaclasificacionLabel'>
                {message}
              </h5>
            </div>
          </Modal.Title>
        </Modal.Header>
        <style jsx>{`
          .notification .modal-header .modal-title {
            min-height: 150px;
          }

          .notificacion .lf-icon-bookmarks,
          .notification .lf-icon-warning {
            font-size: 48px !important;
          }

          .modal-header .close {
            position: relative;
            top: -50px;
          }
        `}</style>
      </Modal>
    );
  }
}

export default Progress;
