import React, { Fragment } from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  rowSelected
} from '@syncfusion/ej2-react-grids';
import { L10n } from '@syncfusion/ej2-base';
import i18n from 'i18next';
import {
  getImplantations,
  Implantation
} from '../../../services/services-centinela';
import ImplantationListSearch from '../implantation-list-search/implantation-list-search';
//import ImplantationListSearch from '../implantation-list-search/implantation-list-search';

L10n.load({
  'es-ES': {
    grid: {
      EmptyRecord: 'No hay datos que mostrar'
    }
  }
});

interface Props {
  user: string;
  show: boolean;
  implantation: any;
  toggleNotification?: (msg: string, error: boolean) => void;
  onImplantation: (id: Implantation) => void;
}
interface State {
  implantations: any;
  counter: number;
  rowSelected: number;
  currentPage: number;
  search: string;
  showSpinner: boolean;
  lastPage: boolean;
}

export class Step2 extends React.Component<Props, State> {
  private toolbarOptions: any;
  private gridRef: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      implantations: [],
      counter: 0,
      rowSelected: -1,
      currentPage: 1,
      search: '',
      showSpinner: true,
      lastPage: false
    };
    this.toolbarOptions = ['Search'];
    this.renderCheck = this.renderCheck.bind(this);
    this.onRowSelected = this.onRowSelected.bind(this);
    this.gridRef = null;
    this.searchResultsByType = this.searchResultsByType.bind(this);
  }

  async componentDidUpdate(prevProps: Props, prevState: State) {
    const { user, toggleNotification } = this.props;
    const { currentPage, search } = this.state;

    if (prevProps.show === false && this.props.show === true) {
      const opened = document.getElementsByClassName(
        'lexon-clasification-list-searcher search-close-2 opened'
      );
      if (opened && opened.length > 0) {
        const closeButton: any = document.getElementsByClassName(
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

    if (prevProps.implantation !== this.props.implantation) {
      this.setState({ rowSelected: -1 });
    }

    if (
      (prevProps.show === false && this.props.show === true) ||
      prevProps.implantation !== this.props.implantation ||
      prevState.search !== this.state.search ||
      (prevState.currentPage !== this.state.currentPage &&
        this.state.currentPage > -1)
    ) {
      try {
        this.setState({ showSpinner: true });
        const response = await getImplantations(user, search, 6, currentPage);

        if (response && response.results && response.results.data) {
          let lastPage = response.results.count < 6;
          this.setState(
            {
              implantations: [...response.results.data],
              counter: response.results.count,
              lastPage,
              showSpinner: false
            },
            () => {}
          );
        }
      } catch (err) {
        toggleNotification &&
          toggleNotification(
            'Errores: ' + err.errors.map((e: any) => e.message).join('; '),
            true
          );
        this.setState({
          implantations: [],
          counter: 0,
          lastPage: false,
          showSpinner: false
        });
      }
    }
  }

  renderCheck(item: any) {
    console.log('RenderCheck');
    const check = item.Id === this.state.rowSelected ? 'checked' : '';
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

  onRowSelected(event: any) {
    const { rowSelected } = this.state;
    const { onImplantation } = this.props;
    if (rowSelected !== event.data.Id) {
      this.setState({ rowSelected: event.data.Id }, () => {
        onImplantation(event.data);
      });
    }
  }

  searchResultsByType(type: any, search: string) {
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
    const { implantation } = this.props;
    const { counter, implantations, currentPage, rowSelected } = this.state;

    return (
      <Fragment>
        <div className='step2-container'>
          <ol style={{ textAlign: 'center' }}>
            <li className='index-3'>
              <span>{i18n.t(`modal-archive.q3`)}</span>
            </li>
          </ol>
          <section className='section-border'>
            <p className='section-title'>{'FILTRAR POR PRODUCTO'}</p>
            <ImplantationListSearch
              closeClassName='search-close-2'
              searchResultsByType={this.searchResultsByType}
              countResults={counter}></ImplantationListSearch>
            <div style={{ height: 300 }}>
              <GridComponent
                ref={g => (this.gridRef = g)}
                dataSource={implantations}
                height={'300px'}
                selectionSettings={{ type: 'Single', mode: 'Row' }}
                locale='es-ES'
                rowSelected={event => {
                  this.onRowSelected(event);
                }}>
                <ColumnsDirective>
                  <ColumnDirective
                    headerText=''
                    field={'' + rowSelected}
                    width='50'
                    template={this.renderCheck}
                  />
                  <ColumnDirective
                    field='Description'
                    headerText='Implantación'></ColumnDirective>
                  <ColumnDirective
                    field='Organization'
                    headerText='Organización'
                    width='150'></ColumnDirective>
                </ColumnsDirective>
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
