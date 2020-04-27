import React, { Fragment } from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  rowSelected
} from '@syncfusion/ej2-react-grids';
import { L10n } from '@syncfusion/ej2-base';
import i18n from 'i18next';
import { getPhases, Phase } from '../../../services/services-centinela';
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
  onPhase: (id: Phase) => void;
}
interface State {
  phases: any;
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
      rowSelected: -1,
      showSpinner: true
    };
    this.toolbarOptions = ['Search'];
    this.onRowSelected = this.onRowSelected.bind(this);
    this.renderArrow = this.renderArrow.bind(this);
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

    if (prevProps.implantation !== this.props.implantation) {
      this.setState({ rowSelected: -1 });
    }

    if (
      (prevProps.show === false && this.props.show === true) ||
      prevProps.implantation !== this.props.implantation
    ) {
      try {
        this.setState({ showSpinner: true });
        const response = await getPhases(user, implantation.Id);

        if (response && response.results && response.results.data) {
          this.setState(
            {
              phases: [...response.results.data],
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
    const { rowSelected } = this.state;
    const { onPhase } = this.props;
    if (rowSelected !== event.data.Id) {
      this.setState({ rowSelected: event.data.Id }, () => {
        onPhase(event.data.Id);
      });
    }
  }

  renderArrow(row: any) {
    return <i className='lf-icon-angle-right row-arrow'></i>;
  }

  render() {
    const { implantation } = this.props;
    const { phases: implantations, rowSelected } = this.state;

    return (
      <Fragment>
        <div className='step3-container'>
          <div className='titles-container'>
            <div className='section-title'>{implantation?.Description}</div>
            <div className='section-title'>{implantation?.Organization}</div>
          </div>

          <section className='section-border'>
            <div className='breadcrumbs'>{implantation?.Type}</div>
            <div style={{ height: 400 }}>
              <GridComponent
                ref={g => (this.gridRef = g)}
                dataSource={implantations}
                height={'400px'}
                selectionSettings={{ type: 'Single', mode: 'Row' }}
                locale='es-ES'
                rowSelected={event => {
                  this.onRowSelected(event);
                }}>
                <ColumnsDirective>
                  <ColumnDirective
                    field='Description'
                    headerText={implantation?.Type}></ColumnDirective>
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
