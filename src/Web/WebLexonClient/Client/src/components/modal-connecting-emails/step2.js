import React, { Fragment } from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective
} from '@syncfusion/ej2-react-grids';
import { L10n } from '@syncfusion/ej2-base';
import i18n from 'i18next';
import { getResults } from '../../services/services-lexon';
import Spinner from '../../components/spinner/spinner';
import ClassificationListSearch from '../classify-emails/classification-list-search/classification-list-search';

L10n.load({
  'es-ES': {
    grid: {
      EmptyRecord: 'No hay datos que mostrar'
    }
  }
});

export class ConnectingEmailsStep2 extends React.Component {
  constructor() {
    super();
    this.state = {
      entities: [],
      counter: 0,
      rowSelected: -1,
      currentPage: 1,
      search: '',
      showSpinner: true,
      lastPage: false
    };
    this.toolbarOptions = ['Search'];
    this.renderCheck = this._renderCheck.bind(this);
    this.gridRef = null;
    this.searchResultsByType = this.searchResultsByType.bind(this);
  }

  async componentDidUpdate(prevProps, prevState) {
    const { user, bbdd, entity } = this.props;
    const { currentPage, search } = this.state;

    if (prevProps.show === false && this.props.show === true) {
      const opened = document.getElementsByClassName(
        'lexon-clasification-list-searcher search-close-2 opened'
      );
      if (opened && opened.length > 0) {
        const closeButton = document.getElementsByClassName(
          'search-trigger-hide search-close-2'
        )[0];
        if (closeButton) {
          closeButton.click();
        }
      }

      this.setState({ currentPage: -1, search: '', showSpinner: true }, () => {
        this.setState({ currentPage: 1 });
      });
      return;
    }

    if (prevProps.entity !== this.props.entity) {
      this.setState(this.setState({ rowSelected: -1 }));
    }

    if (
      (prevProps.show === false && this.props.show === true) ||
      prevProps.entity !== this.props.entity ||
      prevState.search !== this.state.search ||
      (prevState.currentPage !== this.state.currentPage &&
        this.state.currentPage > -1)
    ) {
      try {
        this.setState({ showSpinner: true });
        const response = await getResults(
          user,
          bbdd,
          entity,
          search,
          6,
          currentPage
        );

        if (response && response.results && response.results.data) {
          let lastPage = response.results.count < 6;
          this.setState(
            {
              entities: [...response.results.data],
              counter: response.results.count,
              lastPage,
              showSpinner: false
            },
            () => {}
          );
        }
      } catch (err) {
        this.props.toggleNotification(
          'Errores: ' + err.errors.map(e => e.message).join('; '),
          true
        );
        this.setState({
          entities: [],
          counter: 0,
          lastPage: false,
          showSpinner: false
        });
      }
    }
  }

  _renderCheck(props) {
    console.log('RenderCheck');
    const ix = props.idRelated + '_' + props.idType;
    const check = ix === this.state.rowSelected ? 'checked' : '';
    return (
      <div className={`row-check ${check}`}>
        <div className={`row-check-inner ${check}`}></div>
      </div>
    );
  }

  nextPage() {
    if (this.state.lastPage === false) {
      const np = this.state.currentPage + 1;
      this.setState({ currentPage: np, showSpinner: true });
    }
  }

  prevPage() {
    if (this.state.currentPage > 1) {
      const np = this.state.currentPage - 1;
      this.setState({ currentPage: np, showSpinner: true });
    }
  }

  onRowSelected(event) {
    this.setState(
      { rowSelected: event.data.idRelated + '_' + event.data.idType },
      () => {
        this.props.onSelectedEntity &&
          this.props.onSelectedEntity({
            ...event.data,
            id: event.data.idRelated
          });
        this.gridRef && this.gridRef.refresh();
      }
    );
  }

  searchResultsByType(type, search) {
    if (this.state.search !== search) {
      this.setState({
        search: search || '',
        showSpinner: true,
        currentPage: 1,
        counter: 0
      });
    }
  }

  render() {
    const { entity } = this.props;
    const { counter, entities, currentPage } = this.state;

    return (
      <Fragment>
        <div className='step2-container'>
          <ol style={{ textAlign: 'center' }}>
            <li className='index-3'>
              <span>{i18n.t(`connecting.q3_${entity}`)}</span>
            </li>
          </ol>
          <section className='section-border'>
            <p className='section-title'>
              {i18n.t(`classification.${entity}`)}
            </p>
            <ClassificationListSearch
              closeClassName='search-close-2'
              searchResultsByType={this.searchResultsByType}
              countResults={counter}></ClassificationListSearch>
            <div style={{ height: 300 }}>
              {this.state.showSpinner === true && (
                <div className='spinner'>
                  {' '}
                  <Spinner />
                </div>
              )}

              <GridComponent
                ref={g => (this.gridRef = g)}
                dataSource={entities}
                height={'300px'}
                selectionSettings={{ type: 'Single', mode: 'Row' }}
                hideScroll={true}
                locale='es-ES'
                rowSelected={event => {
                  this.onRowSelected(event);
                }}>
                {entity === 1 && (
                  <ColumnsDirective>
                    <ColumnDirective
                      headerText=''
                      field='id'
                      width='40'
                      template={this.renderCheck}
                    />
                    <ColumnDirective
                      field='code'
                      headerText='Código'
                      width='100'></ColumnDirective>
                    <ColumnDirective
                      field='intervening'
                      headerText='Cliente'
                      width='150'></ColumnDirective>
                    <ColumnDirective
                      field='description'
                      headerText='Descripción'
                      width='170'></ColumnDirective>
                  </ColumnsDirective>
                )}
                {entity !== 1 && (
                  <ColumnsDirective>
                    <ColumnDirective
                      headerText=''
                      width='40'
                      template={this.renderCheck}
                    />
                    <ColumnDirective
                      field='description'
                      headerText='Nombre'
                      width='170'></ColumnDirective>
                    <ColumnDirective
                      field='email'
                      headerText='Email'
                      width='150'></ColumnDirective>
                  </ColumnsDirective>
                )}
              </GridComponent>
              <section className='pager'>
                <div
                  className={`prevButton ${
                    this.state.currentPage === 1 ? 'disabled' : ''
                  }`}
                  onClick={() => this.prevPage()}>
                  <span className='pager-icon lf-icon-angle-left' />
                  <span>Anterior</span>
                </div>
                <div className='currentPage'>{currentPage}</div>
                <div
                  className={`nextButton ${
                    this.state.lastPage === true ? 'disabled' : ''
                  }`}
                  onClick={() => this.nextPage()}>
                  <span>Siguiente</span>
                  <span className='pager-icon lf-icon-angle-right' />
                </div>
              </section>
            </div>
          </section>
        </div>
        <style jsx>
          {`
            .e-headercelldiv {
              outline: none !important;
            }
            .step2-container {
              margin: 30px;
            }

            .section-border {
              position: sticky;
              border: 1px solid #d2d2d2;
              height: 450px;
            }

            .section-title {
              color: #001978;
              font-family: 'MTTMilano-Medium' !important;
              font-size: 16px;
              font-weight: 500;
              margin-left: 10px;
              margin-top: 10px;
              text-transform: uppercase;
            }

            .spinner {
              position: absolute;
              top: 90px;
              right: 0;
              width: 100%;
              height: calc(100% - 90px);
              z-index: 100;
              background: rgba(255, 255, 255, 0.8);
            }

            .pager-icon {
              font-size: 18px;
              font-weight: bold;
              color: #001978;
            }
            .prevButton,
            .nextButton {
              display: flex;
              align-items: center;
              color: #001978;
              font-family: 'MTTMilano-Medium' !important;
              font-size: 12px;
              font-weight: 500;
              text-transform: uppercase;
              cursor: pointer;
            }
            .pager {
              display: flex;
              width: 100%;
              justify-content: center;
            }
            .currentPage {
              color: #001978;
            }
            .row-check {
              width: 24px;
              height: 24px;
              border: 1px solid #7c868c;
              border-radius: 50%;
            }
            .row-check-inner {
              margin: auto;
              margin-top: 2px;
              width: 18px;
              height: 18px;
              background-color: transparent;
              border-radius: 50%;
            }
            .row-check-inner.checked {
              background-color: #001978 !important;
            }
            .row-check.checked {
              border: 1px solid #001978 !important;
            }
            .e-content {
              overflow-y: hidden !important;
            }
            .e-primary.list {
              margin-top: -25px !important;
              padding: 0 !important;
            }
            .e-emptyrow {
              text-align: center;
            }
            .e-rowcell .e-templatecell {
              padding: 0 !important;
            }
            .e-row {
              height: 50px !important;
              cursor: pointer !important;
            }
            .e-rowcell {
              color: #7c868c !important;
              font-family: 'MTTMilano-Medium' !important;
              font-size: 14px !important;
              font-weight: 500 !important;
              line-height: 22px !important;
              cursor: pointer !important;
            }

            ol > li.index-3::before {
              content: '3';
              color: #001978;
              display: inline-block;
              width: 1em;
              margin-left: -1em;
              background-color: #e5e8f1;
              border-radius: 50%;
              height: 32px;
              width: 32px;
              text-align: center;
              font-family: 'MTTMilano-Medium';
              font-size: 16px;
              font-weight: bold;
            }
            .e-rowcell {
              outline: none;
            }
            .e-grid,
            .e-gridheader,
            .e-headercontent {
              border: none !important;
            }

            .e-headertext {
              color: #001978 !important;
              font-family: 'MTTMilano-Medium' !important;
              font-size: 13px !important;
              font-weight: bold !important;
            }

            .e-gridheader {
              border-top: none !important;
              border-left: none !important;
              border-right: none !important;
              border-bottom: 1px solid #001978 !important;
            }

            .prevButton {
              margin-right: 20px;
            }

            .prevButton.disabled,
            .prevButton.disabled > .pager-icon,
            .nextButton.disabled,
            .nextButton.disabled > .pager-icon {
              cursor: default;
              color: #7c868c !important;
            }

            .nextButton {
              margin-left: 20px;
            }
          `}
        </style>
      </Fragment>
    );
  }
}
