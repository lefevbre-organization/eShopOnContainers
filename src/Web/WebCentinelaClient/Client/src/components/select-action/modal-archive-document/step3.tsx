import React, { Fragment } from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  rowSelected,
} from '@syncfusion/ej2-react-grids';
import { L10n } from '@syncfusion/ej2-base';
import i18n from 'i18next';
import {
  getEvaluationById,
  getEvaluationTree,
} from '../../../services/services-centinela';
import ImplantationListSearch from '../implantation-list-search/implantation-list-search';
//import ImplantationListSearch from '../implantation-list-search/implantation-list-search';

L10n.load({
  'es-ES': {
    grid: {
      EmptyRecord: 'No hay datos que mostrar',
    },
  },
});

interface Props {
  user: string;
  show: boolean;
  implantation: any;
  toggleNotification?: (msg: string, error: boolean) => void;
  // onPhase: (id: Evaluation) => void;
}
interface State {
  phases: any;
  route: any;
  currentNodes: any;
  rowSelected: number;
  showSpinner: boolean;
}

export class Step3 extends React.Component<Props, State> {
  private toolbarOptions: any;
  private gridRef: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      phases: [],
      route: [],
      currentNodes: { items: [] },
      rowSelected: -1,
      showSpinner: true,
    };
    this.toolbarOptions = ['Search'];
    this.onRowSelected = this.onRowSelected.bind(this);
    this.renderArrow = this.renderArrow.bind(this);
    this.renderIcon = this.renderIcon.bind(this);
    this.renderTitle = this.renderTitle.bind(this);
    this.gridRef = null;
  }

  async componentDidUpdate(prevProps: Props, prevState: State) {
    const { user, toggleNotification, implantation } = this.props;

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
              phases: [...response.data],
              currentNodes: {
                node: 'root',
                items: [...response.data],
              },
              showSpinner: false,
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
          showSpinner: false,
        });
      }
    }
  }

  onRowSelected(event: any) {
    const { rowSelected, route } = this.state;
    const nr = [...route, event.data];

    this.setState({
      route: nr,
      currentNodes: {
        node: 'id',
        items: [...event.data.children, ...event.data.concepts],
      },
    });
    // if (rowSelected !== event.data.Id) {
    //   this.setState({ rowSelected: event.data.Id }, () => {
    //     //onPhase(event.data.Id);
    //   });
    // }
  }

  renderArrow(row: any) {
    return <i className='lf-icon-angle-right row-arrow'></i>;
  }

  renderIcon(row: any) {
    if (!row.conceptId) {
      return <i className='lf-icon-folder'></i>;
    } else {
      return <i className='lf-icon-compliance'></i>;
    }
  }

  renderTitle(row: any) {
    if (row.name) {
      return <span>{row.name}</span>;
    } else {
      return <span>{row.title}</span>;
    }
  }

  renderBreadcrumbs() {
    const { route } = this.state;
    return (
      <div className='breadcrumb-link'>
        {route.map((r: any, i: number) => {
          if (i > 0) {
            return (
              <>
                <span>{' > '}</span>
                <span className='breadcrumb-link'>{r.name}</span>
              </>
            );
          }
          return r.name;
        })}
      </div>
    );
  }

  render() {
    const { implantation, show } = this.props;
    const { phases: implantations, rowSelected, currentNodes } = this.state;
    if (show === false) return null;

    return (
      <Fragment>
        <div className='step3-container'>
          <div className='titles-container'>
            <div className='section-title'>{implantation?.productName}</div>
            <div className='section-title'>{implantation?.clientName}</div>
          </div>

          <section className='section-border'>
            <div className='breadcrumbs'>{this.renderBreadcrumbs()}</div>
            <div style={{ height: 447 }}>
              <GridComponent
                ref={(g) => (this.gridRef = g)}
                dataSource={currentNodes.items}
                height={'447px'}
                selectionSettings={{ type: 'Single', mode: 'Row' }}
                locale='es-ES'
                rowSelected={(event) => {
                  this.onRowSelected(event);
                }}>
                <ColumnsDirective>
                  <ColumnDirective
                    width='50'
                    field='conceptId'
                    headerText={''}
                    template={this.renderIcon}></ColumnDirective>
                  <ColumnDirective
                    field='name'
                    headerText={implantation?.Type}
                    template={this.renderTitle}></ColumnDirective>
                  <ColumnDirective
                    width='50'
                    template={this.renderArrow}></ColumnDirective>
                </ColumnsDirective>
              </GridComponent>
            </div>
          </section>
        </div>
        <style jsx>
          {`
            .breadcrumb-link {
              color: #001978;
              cursor: pointer;
            }
            .breadcrumb-link span:hover {
              text-decoration: underline;
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

            table.e-table thead {
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
