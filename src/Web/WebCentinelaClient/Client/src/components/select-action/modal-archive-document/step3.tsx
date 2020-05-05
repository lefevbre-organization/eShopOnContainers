import React, { Fragment, createRef } from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  rowSelected,
  Inject,
  Sort,
  Filter
} from '@syncfusion/ej2-react-grids';
import { L10n } from '@syncfusion/ej2-base';
import i18n from 'i18next';
import moment from 'moment';

import {
  getEvaluationById,
  getEvaluationTree,
  getInstances,
  CentInstance
} from '../../../services/services-centinela';
import ImplantationListSearch from '../implantation-list-search/implantation-list-search';
import Spinner from '../../spinner/spinner';
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
  onInstanceSelected: (instance: CentInstance) => void;
  // onPhase: (id: Evaluation) => void;
}
interface State {
  phases: any;
  route: any;
  gridHeight: number;
  currentNodes: any;
  rowSelected: number;
  instances: any;
  showSpinner: boolean;
  substep: number;
}

type IFilterOptions = {
  type: 'Menu';
};
export class Step3 extends React.Component<Props, State> {
  private toolbarOptions: any;
  private gridRef: any;
  private crumbRef: any;
  private FilterOptions: IFilterOptions = { type: 'Menu' };
  constructor(props: Props) {
    super(props);
    this.state = {
      phases: [],
      route: [],
      instances: [],
      gridHeight: 0,
      substep: 0,
      currentNodes: { items: [] },
      rowSelected: -1,
      showSpinner: true
    };
    this.toolbarOptions = ['Search'];
    this.onRowSelected = this.onRowSelected.bind(this);
    this.renderArrow = this.renderArrow.bind(this);
    this.renderIcon = this.renderIcon.bind(this);
    this.renderTitle = this.renderTitle.bind(this);
    this.renderInstanceCheck = this.renderInstanceCheck.bind(this);
    this.onInstanceSelected = this.onInstanceSelected.bind(this);

    this.gridRef = null;
    this.crumbRef = createRef();
  }

  async componentDidUpdate(prevProps: Props, prevState: State) {
    const { user, toggleNotification, implantation } = this.props;
    const { gridHeight } = this.state;

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

      return;
    }

    if (this.crumbRef && this.crumbRef.current) {
      if (gridHeight !== this.crumbRef.current.offsetHeight) {
        this.setState({ gridHeight: this.crumbRef.current.offsetHeight });
      }
    }

    if (
      (prevProps.show === false && this.props.show === true) ||
      prevProps.implantation !== this.props.implantation
    ) {
      try {
        this.setState({ showSpinner: true });
        const response = await getEvaluationTree(
          user,
          implantation.evaluationId
        );
        console.log(response);

        if (response.errors.length === 0) {
          this.setState(
            {
              route: [],
              phases: [...response.data],
              currentNodes: {
                node: 'root',
                items: [...response.data]
              },
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
          phases: [],
          showSpinner: false
        });
      }
    }
  }

  onRowSelected(event: any) {
    const { route } = this.state;
    const nr = [...route, event.data];

    if (event.data.conceptId && event.data.conceptId > 0) {
      this.setState(
        {
          route: nr,
          substep: 1,
          showSpinner: true
        },
        () => {
          this.loadInstances(event.data.conceptId);
        }
      );
    } else {
      this.setState({
        route: nr,
        currentNodes: {
          node: 'id',
          items: [...event.data.children, ...event.data.concepts]
        }
      });
    }
  }

  async loadInstances(conceptId: string) {
    const { user } = this.props;
    const response = await getInstances(user, conceptId);
    this.setState({ showSpinner: false, instances: response.data });
  }

  renderArrow(row: any) {
    return <i className="lf-icon-angle-right row-arrow"></i>;
  }

  renderIcon(row: any) {
    if (!row.conceptId) {
      return <i className="lf-icon-folder"></i>;
    } else {
      return <i className="lf-icon-compliance"></i>;
    }
  }

  renderTitle(row: any) {
    if (row.name) {
      return <span>{row.name}</span>;
    } else {
      return <span>{row.title}</span>;
    }
  }

  onBreadcrumb(r?: any) {
    const rts: any = [];
    let index: number = 0;

    if (!r) {
      this.setState({
        route: rts,
        substep: 0,
        currentNodes: {
          node: 'root',
          items: [...this.state.phases]
        }
      });
      return;
    }

    for (let i = 0; i < this.state.route.length; i++) {
      rts.push(this.state.route[i]);

      if (this.state.route[i].folderId === r.folderId) {
        index = i;
        break;
      }
    }

    let cn: any = null;
    if (index >= 0) {
      cn = this.state.route[index];
    }

    this.setState({
      route: rts,
      substep: 0,
      currentNodes: {
        node: cn,
        items: [...cn.children, ...cn.concepts]
      }
    });
  }

  renderBreadcrumbs() {
    const { route } = this.state;
    if (route.length === 0) {
      return null;
    }
    return (
      <div>
        <span
          className="breadcrumb-first"
          onClick={() => {
            this.onBreadcrumb();
          }}
        >
          <i className="lf-icon-map-marker"></i>
        </span>
        {route.map((r: any, i: number, rt: any) => {
          if (i >= 0 && i < rt.length - 1) {
            return (
              <>
                {i > 0 && <span>{' > '}</span>}
                <span
                  className="breadcrumb-link"
                  onClick={() => {
                    this.onBreadcrumb(r);
                  }}
                >
                  {r.name || r.title}
                </span>
              </>
            );
          } else if (i === rt.length - 1) {
            return (
              <>
                {i > 0 && <span>{' > '}</span>}
                <span className="breadcrumb-last">{r.name || r.title}</span>
              </>
            );
          }
        })}
      </div>
    );
  }

  renderCreationDate(row: CentInstance) {
    const d = moment(row.creationDate);
    return <div>{d.format('DD/MM/YYYY')}</div>;
  }

  renderModificationDate(row: CentInstance) {
    const d = moment(row.creationDate);
    return <div>{d.format('DD/MM/YYYY')}</div>;
  }

  renderInstanceCheck(row: CentInstance) {
    const check = row.conceptId === this.state.rowSelected ? 'checked' : '';
    return (
      <div className={`row-check ${check}`}>
        <div className={`row-check-inner ${check}`}></div>
      </div>
    );
  }

  onInstanceSelected(instance: CentInstance) {
    this.setState({ rowSelected: instance.conceptId }, () => {
      this.props.onInstanceSelected(instance);
    });
  }

  render() {
    const { implantation, show } = this.props;
    const {
      phases: implantations,
      rowSelected,
      currentNodes,
      gridHeight,
      substep,
      showSpinner,
      instances
    } = this.state;
    let height = 447 - gridHeight;
    if (show === false) return null;

    return (
      <Fragment>
        <div className="step3-container">
          <div className="titles-container">
            <div className="section-title">{implantation?.productName}</div>
            <div className="section-title">{implantation?.clientName}</div>
          </div>

          <section className="section-border">
            {showSpinner === true && (
              <div className="spinner-wrapper">
                <Spinner />
              </div>
            )}
            <div ref={this.crumbRef} className="breadcrumbs">
              {this.renderBreadcrumbs()}
            </div>
            {substep === 0 && (
              <div style={{ height }} className="substep0">
                <GridComponent
                  ref={(g) => (this.gridRef = g)}
                  dataSource={currentNodes.items}
                  height={`${height}px`}
                  selectionSettings={{ type: 'Single', mode: 'Row' }}
                  locale="es-ES"
                  rowSelected={(event) => {
                    this.onRowSelected(event);
                  }}
                >
                  <ColumnsDirective>
                    <ColumnDirective
                      width="60"
                      field="conceptId"
                      headerText={''}
                      template={this.renderIcon}
                    ></ColumnDirective>
                    <ColumnDirective
                      field="name"
                      headerText={implantation?.Type}
                      template={this.renderTitle}
                    ></ColumnDirective>
                    <ColumnDirective
                      width="50"
                      template={this.renderArrow}
                    ></ColumnDirective>
                  </ColumnsDirective>
                </GridComponent>
              </div>
            )}
            {substep === 1 && (
              <div style={{ height }} className="substep1">
                <GridComponent
                  ref={(g) => (this.gridRef = g)}
                  dataSource={instances}
                  allowSorting={true}
                  allowFiltering={true}
                  filterSettings={this.FilterOptions}
                  height={`${height}px`}
                  selectionSettings={{ type: 'Single', mode: 'Row' }}
                  locale="es-ES"
                  rowSelected={(event: any) => {
                    this.onInstanceSelected(event.data as CentInstance);
                  }}
                >
                  <ColumnsDirective>
                    <ColumnDirective
                      width="50"
                      field={'' + rowSelected}
                      headerText={''}
                      template={this.renderInstanceCheck}
                    ></ColumnDirective>
                    <ColumnDirective
                      field="title"
                      headerText={i18n.t('modal-archive.table-title')}
                    ></ColumnDirective>
                    <ColumnDirective
                      width="150"
                      field="author"
                      headerText={i18n.t('modal-archive.author')}
                    ></ColumnDirective>
                    <ColumnDirective
                      width="120"
                      field="creationDate"
                      allowFiltering={false}
                      headerText={i18n.t('modal-archive.creation')}
                      template={this.renderCreationDate}
                    ></ColumnDirective>
                    <ColumnDirective
                      width="130"
                      allowFiltering={false}
                      field="modificationDate"
                      headerText={i18n.t('modal-archive.modification')}
                      template={this.renderModificationDate}
                    ></ColumnDirective>
                  </ColumnsDirective>
                  <Inject services={[Sort, Filter]} />
                </GridComponent>
              </div>
            )}
          </section>
        </div>
        <style jsx>
          {`
            .breadcrumbs span {
              color: #001978;
            }

            .breadcrumb-first {
              color: #001978;
              cursor: pointer;
            }

            .breadcrumb-link {
              color: #001978;
              cursor: pointer;
              text-decoration: underline;
            }

            .breadcrumb-last {
            }

            .breadcrumb-link:hover {
              text-decoration: underline;
            }
            .breadcrumb-first .lf-icon-map-marker {
              margin: 0 10px;
            }

            .e-headercelldiv {
              outline: none !important;
            }
            .step3-container {
              margin: 30px;
            }

            .step3-container .titles-container {
              display: flex;
              justify-content: space-between;
            }
            .e-row .row-arrow {
              display: none;
              font-weight: bolder;
              color: #001978;
              font-size: 20px;
            }

            table.e-table {
              overflow: auto !important;
            }

            .substep0 table.e-table thead {
              display: none;
            }

            .e-row:hover .row-arrow {
              display: block;
            }

            .section-border {
              position: sticky;
              border: 1px solid #d2d2d2;
              height: 450px;
            }

            .step3-container .section-title {
              color: #001978;
              font-family: 'MTTMilano-Medium' !important;
              font-size: 16px;
              font-weight: 500;
              margin-left: 10px;
              margin-top: 10px;
              text-transform: none;
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
              overflow-y: auto !important;
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
