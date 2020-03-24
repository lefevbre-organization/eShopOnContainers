import React, { Fragment } from 'react';
import i18n from 'i18next';
import { getTypes } from '../../services/services-lexon';
import { Button } from 'react-bootstrap';

export class AttachDocumentsStep1 extends React.Component {
  async componentDidMount() {}

  render() {
    const { onClickCasefiles, onClickContacts } = this.props;
    return (
      <Fragment>
        <div className='step1-container'>
          <div className=''>
            <p className='subtitle'>
              Usa el buscador o explora tus expedientes y contactos para
              loclaizar los archivos de Lex-on
            </p>
            <p>
              Haz una búsqueda directa de los archivos que quieres adjuntar.
              (Próximamente)
            </p>
          </div>
          <div>
            <input disabled placeholder='Busca tu archivo'></input>
          </div>
          <div className='button-container'>
            <Button bsPrefix='btn btn-primary' onClick={() => {}}>
              {i18n.t('modal-attach-documents.search')}
            </Button>
          </div>

          <div style={{ marginTop: 30 }}>
            <p>
              O bien localiza tus archivos explorando los expedientes y la
              agenda de contactos.
            </p>
            <div className='buttons'>
              <div>
                <p
                  className='add-more-container add-more'
                  onClick={() => {
                    return onClickCasefiles && onClickCasefiles();
                  }}>
                  <span className='lf-icon-law'></span>
                  <strong>
                    {i18n.t('modal-attach-documents.explore-files')}
                  </strong>
                </p>
              </div>
              <div>
                <p
                  className='add-more-container add-more'
                  onClick={() => {
                    return onClickContacts && onClickContacts();
                  }}>
                  <span className='lf-icon-contacts'></span>
                  <strong>
                    {i18n.t('modal-attach-documents.explore-contacts')}
                  </strong>
                </p>
              </div>
            </div>
          </div>
        </div>
        <style jsx>
          {`
            .step1-container {
              margin: 50px;
            }
            input {
              width: 100%;
            }
            p {
              color: #333333 !important;
              font-family: 'MTTMilano-Medium' !important;
              font-size: 14px;
              font-weight: 500 !important;
              letter-spacing: 0 !important;
            }
            .subtitle {
              color: #7f8cbb !important;
              font-family: 'MTTMilano-Medium' !important;
              font-size: 20px;
              font-weight: 500;
            }
            .buttons {
              display: flex;
              justify-content: space-evenly;
            }
            .button-container {
              text-align: right;
              margin-top: 20px;
            }
            .buttons p {
              color: #001978 !important;
            }
          `}
        </style>
      </Fragment>
    );
  }
}
