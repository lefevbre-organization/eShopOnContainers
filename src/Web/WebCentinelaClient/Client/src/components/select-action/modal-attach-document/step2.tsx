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
  getUser,
  Evaluation,
  CentUser
} from '../../../services/services-centinela';
import * as _ from 'lodash';
import ImplantationListSearch from '../implantation-list-search/implantation-list-search';
import Spinner from '../../spinner/spinner';
import { ProductFilter } from './product-filter';
import { Search } from '@syncfusion/ej2-react-dropdowns';

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
  onImplantation: (id: Evaluation) => void;
}
interface State {
  implantations: any;
  counter: number;
  rowSelected: number;
  currentPage: number;
  search: string;
  lastPage: boolean;
  showSpinner: boolean;
  productFilter: string;
}

export class Step2 extends React.Component<Props, State> {
  private toolbarOptions: any;
  private gridRef: any;
  private allImplantations: any;
  private searchImplantations: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      implantations: [],
      showSpinner: false,
      counter: 0,
      rowSelected: -1,
      currentPage: 1,
      search: '',
      lastPage: false,
      productFilter: ''
    };
    this.toolbarOptions = ['Search'];
    this.renderCheck = this.renderCheck.bind(this);
    this.onRowSelected = this.onRowSelected.bind(this);
    this.gridRef = null;
    this.searchResultsByType = this.searchResultsByType.bind(this);
    this.onProductFilter = this.onProductFilter.bind(this);
  }

  async componentDidMount() {}

  async componentDidUpdate(prevProps: Props, prevState: State) {
    const { show, user } = this.props;

    if (show === true && prevProps.show === false) {
      this.setLoadingStatus(true);
      const response = await getUser(user);
      this.allImplantations = (response.data as CentUser).evaluations;
      this.searchImplantations = this.allImplantations;

      if(this.state.productFilter !== '') {
        this.setLoadingStatus(false);
        this.onProductFilter(this.state.productFilter);
      } else {
        this.setState({
          currentPage: 1,
          lastPage: this.searchImplantations.length <= 6,
          counter: this.searchImplantations.length,
          implantations: _.slice(this.searchImplantations, 0, 6),
          showSpinner: false
        });

      }
    }
  }

  setLoadingStatus(show: boolean) {
    this.setState({ showSpinner: show });
  }

  renderCheck(item: any) {
    const check = item.evaluationId === this.state.rowSelected ? 'checked' : '';
    return (
      <div className={`row-check ${check}`}>
        <div className={`row-check-inner ${check}`}></div>
      </div>
    );
  }

  nextPage() {
    let lp = false;
    if (this.state.lastPage === false) {
      const np = this.state.currentPage + 1;
      const fi = (np - 1) * 6;
      if (fi + 6 >= this.searchImplantations.length) {
        lp = true;
      }
      this.setState({
        currentPage: np,
        lastPage: lp,
        implantations: _.slice(this.searchImplantations, (np - 1) * 6, fi + 6)
      });
    }
  }

  prevPage() {
    let lp = false;

    if (this.state.currentPage > 1) {
      const np = this.state.currentPage - 1;
      const fi = (np - 1) * 6;
      if (fi + 6 >= this.searchImplantations.length) {
        lp = true;
      }

      this.setState({
        currentPage: np,
        lastPage: lp,
        implantations: _.slice(this.searchImplantations, (np - 1) * 6, fi + 6)
      });
    }
  }

  onRowSelected(event: any) {
    const { rowSelected } = this.state;
    const { onImplantation } = this.props;
    if (rowSelected !== event.data.evaluationId) {
      this.setState(
        {
          rowSelected: event.data.evaluationId
        },
        () => {
          onImplantation(event.data);
        }
      );
    }
  }

  onProductFilter(search: string) {
    if (this.state.search !== search) {
      this.setState(
        {
          search: search || '',
          currentPage: 1,
          counter: 0,
          productFilter: search,
          showSpinner: true
        },
        () => {
          var re = new RegExp(search, 'i');
          this.searchImplantations = this.allImplantations.filter(
            (item: Evaluation) => {
              if (item.productName.search(re) != -1) {
                return true;
              }
              return false;
            }
          );

          this.setState({
            showSpinner: false,
            lastPage: this.searchImplantations.length <= 6,
            currentPage: 1,
            productFilter: search,
            counter: this.searchImplantations.length,
            implantations: this.searchImplantations
          });
        }
      );
    }
  }

  searchResultsByType(search: string) {
    const { productFilter } = this.state;

    if (this.state.search !== search) {
      this.setState(
        {
          search: search || '',
          currentPage: 1,
          counter: 0,
          showSpinner: true
        },
        () => {
          const re = new RegExp(search, 'i');
          const re2 =
            productFilter !== ''
              ? new RegExp(productFilter, 'i')
              : new RegExp('.*', 'i');

          this.searchImplantations = this.allImplantations.filter(
            (item: Evaluation) => {
              if (
                (item.name.search(re) != -1 ||
                  item.clientName.search(re) != -1) &&
                item.productName.search(re2) !== -1
              ) {
                return true;
              }
              return false;
            }
          );

          this.setState({
            showSpinner: false,
            lastPage: this.searchImplantations.length <= 6,
            currentPage: 1,
            counter: this.searchImplantations.length,
            implantations: this.searchImplantations
          });
        }
      );
    }
  }

  render() {
    const { implantation } = this.props;
    const {
      showSpinner,
      counter,
      implantations,
      currentPage,
      rowSelected
    } = this.state;
    const products = this.allImplantations
      ? _.uniq(this.allImplantations.map((i: any) => i.productName))
      : [];

    return (
      <Fragment>
        <div className="step2-container">
          <ol style={{ textAlign: 'center' }}>
            <li className="index-3">
              <span>{i18n.t(`modal-attach.q3`)}</span>
            </li>
          </ol>
          <section className="section-border">
            {showSpinner === true && (
              <div className="spinner-wrapper">
                <Spinner />
              </div>
            )}
            <ProductFilter
              products={products as string[]}
              onFilter={this.onProductFilter}
            ></ProductFilter>
            <ImplantationListSearch
              closeClassName="search-close-2"
              searchResultsByType={this.searchResultsByType}
              countResults={counter}
            ></ImplantationListSearch>
            <div style={{ height: 300 }}>
              <GridComponent
                ref={(g) => (this.gridRef = g)}
                dataSource={implantations}
                height={'300px'}
                selectionSettings={{ type: 'Single', mode: 'Row' }}
                locale="es-ES"
                rowSelected={(event) => {
                  this.onRowSelected(event);
                }}
              >
                <ColumnsDirective>
                  <ColumnDirective
                    headerText=""
                    field={'' + rowSelected}
                    width="50"
                    template={this.renderCheck}
                  />
                  <ColumnDirective
                    field="name"
                    headerText="Implantación"
                  ></ColumnDirective>
                  <ColumnDirective
                    field="clientName"
                    headerText="Organización"
                    width="150"
                  ></ColumnDirective>
                </ColumnsDirective>
              </GridComponent>
              <section className="pager">
                <div
                  className={`prevButton ${
                    this.state.currentPage === 1 ? 'disabled' : ''
                  }`}
                  onClick={() => this.prevPage()}
                >
                  <span className="pager-icon lf-icon-angle-left" />
                  <span>Anterior</span>
                </div>
                <div className="currentPage">{currentPage}</div>
                <div
                  className={`nextButton ${
                    this.state.lastPage === true ? 'disabled' : ''
                  }`}
                  onClick={() => this.nextPage()}
                >
                  <span>Siguiente</span>
                  <span className="pager-icon lf-icon-angle-right" />
                </div>
              </section>
            </div>
            )
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

            .spinner-wrapper {
              background-color: rgba(252, 255, 255, 0.8);
              position: absolute;
              top: 0;
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

            li.index-3 {
              margin-left: 8px;
              height: 20px;
              width: 100% !important;
              color: #7f8cbb;
              font-family: 'MTTMilano-Medium';
              font-size: 20px;
              font-weight: 500;
              line-height: 24px;
            }
            ol {
              list-style: none;
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
