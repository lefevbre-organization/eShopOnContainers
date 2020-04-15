import React, { Fragment } from 'react';
import i18n from 'i18next';
import { getTypes } from '../../services/services-lexon';
import { Button } from 'react-bootstrap';

export class AttachDocumentsStep1 extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchText: ''
    }

    this.onKeyPress = this.onKeyPress.bind(this);
  }
  async componentDidMount() { }

  setSearch(search) {
    this.setState({ searchText: search })
  }

  onKeyPress(e) {
    const { onClickSearch } = this.props;

    if (e.charCode === 13) {
      onClickSearch && onClickSearch(this.state.searchText.trim());
    }
  }

  render() {
    const { onClickCasefiles, onClickContacts } = this.props;
    const searchDisabled = (this.state.searchText === '')
    return (
      <Fragment>
        <div className='step1-container'>
          <div className=''>
            <p className='subtitle'>
              Usa el buscador o explora tus expedientes y contactos para
              localizar los archivos de Lex-on
            </p>
            <p>
              Haz una búsqueda directa de los archivos que quieres adjuntar.
            </p>
          </div>
          <div className='input-wrapper'>
            <span className='lf-icon-search'></span>
            <input placeholder='Busca tu archivo'
              value={this.state.searchText}
              onKeyPress={this.onKeyPress}
              onChange={(event) => {
                this.setState({ searchText: event.target.value.trim() })
              }}></input>
            <span className='lf-icon-close ' onClick={() => { this.setState({ searchText: '' }) }}></span>
          </div>
          <div className='button-container'>
            <Button bsPrefix='btn btn-primary' disabled={searchDisabled} onClick={() => {
              this.props.onClickSearch(this.state.searchText.trim());
            }
            }>
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
        <style jsx>{`
            .step1-container {
              margin: 50px;
            }

            .input-wrapper {
              background-color: #e5e8f1;
              height: 45px;
              display: flex;
              padding: 10px;
            }
            .input-wrapper span.lf-icon-close {
              cursor: pointer;
            }
            .input-wrapper span {
              color: #001978;
              font-size: 18px;
              display: flex;
              align-items: center;
            }
            .input-wrapper input {
              width: 100%;
              background-color: transparent;
              border: none !important;
              font-size: 14px;
              color: #001978;
              padding: 0 10px;
            }
            .input-wrapper input:focus {
              border: none !important;
              outline: none;
            }
            .input-wrapper input::placeholder {
              /* Chrome, Firefox, Opera, Safari 10.1+ */
              color: #001978;
              opacity: 1; /* Firefox */
              font-size: 14px;
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
          `}</style>
      </Fragment>
    );
  }
}
