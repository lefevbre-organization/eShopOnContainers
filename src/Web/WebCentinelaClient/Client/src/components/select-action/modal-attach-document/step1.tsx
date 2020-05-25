import React, { Fragment } from 'react';
import { CheckBoxComponent } from '@syncfusion/ej2-react-buttons';
import { Button } from 'react-bootstrap';

import i18n from 'i18next';

interface Props {
  onClickSearch: (search: string) => void;
  onClickExploreImplantations: () => void;
}

interface State {
  types: any;
  searchText: string;
}

export class Step1 extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      types: [],
      searchText: '',
    };

    this.onKeyPress = this.onKeyPress.bind(this);
  }

  async componentDidMount() {}

  componentDidUpdate() {}

  setSearch(search: string) {
    this.setState({ searchText: search });
  }

  onKeyPress(e: any) {
    const { onClickSearch } = this.props;

    if (e.charCode === 13) {
      onClickSearch && onClickSearch(this.state.searchText.trim());
    }
  }

  render() {
    const { onClickExploreImplantations } = this.props;
    const searchDisabled = this.state.searchText === '';

    return (
      <Fragment>
        <div className='step1-container'>
          <div className=''>
            <p className='subtitle'>{i18n.t('modal-attach.q1')}</p>
            <p>
              Haz una búsqueda directa de los archivos que quieres adjuntar.
            </p>
          </div>
          <div className='input-wrapper'>
            <span className='lf-icon-search'></span>
            <input
              placeholder='Busca tu archivo'
              value={this.state.searchText}
              onKeyPress={this.onKeyPress}
              onChange={(event) => {
                this.setState({ searchText: event.target.value.trim() });
              }}></input>
            <span
              className='lf-icon-close '
              onClick={() => {
                this.setState({ searchText: '' });
              }}></span>
          </div>
          <div className='button-container'>
            <Button
              bsPrefix='btn btn-primary'
              disabled={searchDisabled}
              onClick={() => {
                this.props.onClickSearch(this.state.searchText.trim());
              }}>
              {i18n.t('modal-attach.search')}
            </Button>
          </div>

          <div style={{ marginTop: 30 }}>
            <p>{i18n.t('modal-attach.q1c')}</p>
            <div className='buttons'>
              <div>
                <p
                  className='add-more-container add-more'
                  onClick={() => {
                    return (
                      onClickExploreImplantations &&
                      onClickExploreImplantations()
                    );
                  }}>
                  <span className='lf-icon-review'></span>
                  <strong>{i18n.t('modal-attach.explore')}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
        <style jsx>{`
          .step1-container {
            margin: 50px;
          }

          .btn .btn-primary {
            background-color: #001978;
          }

          .btn .btn-primary.disabled {
            background-color: #001978;
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
          .add-more-container {
            cursor: pointer;
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
            justify-content: flex-start;
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
