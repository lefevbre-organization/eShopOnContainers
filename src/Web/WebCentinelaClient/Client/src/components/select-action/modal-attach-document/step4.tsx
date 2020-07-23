import React, { Fragment } from 'react';
import i18n from 'i18next';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Search,
  Sort,
  Page
} from '@syncfusion/ej2-react-grids';
import { CheckBoxComponent } from '@syncfusion/ej2-react-buttons';
import {
  getResults,
  Document,
  CentInstance,
  getDocumentsByInstance
} from '../../../services/services-centinela';
import Spinner from '../../spinner/spinner';
import moment from 'moment';
import ImplantationListSearch from '../implantation-list-search/implantation-list-search';
//import ClassificationListSearch from '../classify-emails/classification-list-search/classification-list-search';

interface Props {
  show: boolean;
  user: string;
  search: string;
  files: any;
  instance?: CentInstance;
  onChange: any;
  onSearchChange: any;
  step: number;
}
interface State {
  entities: any;
  selected: any;
  showSpinner: boolean;
  lastPage: boolean;
  totalResults: number;
  currentPage: number;
  search: string;
  counter: number;
}

type IFilterOptions = {
  type: 'Menu';
};

export class Step4 extends React.Component<Props, State> {
  private FilterOptions: IFilterOptions = { type: 'Menu' };
  private searchRef: any;
  private searchRef2: any;
  private instance: any;
  private allFiles: any;

  constructor(props: Props) {
    super(props);

    this.state = {
      entities: [],
      selected: null,
      showSpinner: false,
      lastPage: false,
      totalResults: -1,
      currentPage: 0,
      search: '',
      counter: 0
    };

    this.searchResultsByType = this.searchResultsByType.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.renderType = this.renderType.bind(this);
    this.renderOrigin = this.renderOrigin.bind(this);
    this.renderDate = this.renderDate.bind(this);
    this.onChangeFile = this.onChangeFile.bind(this);
    this.searchFilesByType = this.searchFilesByType.bind(this);
    this.searchRef = React.createRef();
  }

  async componentDidUpdate(prevProps: Props) {
    const { show, search, user, instance } = this.props;
    const { currentPage } = this.state;

    if (prevProps.show === false && show === true) {
      if(prevProps.step === 5 && this.props.step === 4) {
        return;
      }
      this.setState(
        {
          entities: [],
          selected: null,
          showSpinner: false,
          lastPage: false,
          totalResults: -1,
          currentPage: 0,
          //search: '',
          counter: 0
        },
        () => {
          if (instance) {
            this.instance = instance;
            this.searchResultsByInstance(instance);
          } else {
            this.instance = null;
            this.searchResultsByType(search);
          }
          this.setState({ currentPage: 1 }, () => {
            this.searchRef.current && this.searchRef.current.Search(search);
          });
        }
      );
    }
  }

  nextPage() {
    let lp = false;
    if (this.state.lastPage === false) {
      const np = this.state.currentPage + 1;
      const fi = (np - 1) * 6;
      if (fi + 6 >= this.state.entities.length) {
        lp = true;
      }
      this.setState({
        currentPage: np,
        lastPage: lp
      });
    }
  }

  prevPage() {
    let lp = false;

    if (this.state.currentPage > 1) {
      const np = this.state.currentPage - 1;
      const fi = (np - 1) * 6;
      if (fi + 6 >= this.state.entities.length) {
        lp = true;
      }

      this.setState({
        currentPage: np,
        lastPage: lp
      });
    }
  }

  searchFilesByType(search: any) {
    const { currentPage, showSpinner } = this.state;
    if (showSpinner) {
      return;
    }

    if(search === "" && this.instance) {
      this.searchResultsByInstance(this.instance)
      return;
    }

    this.setState(
      {
        search: search || '',
        showSpinner: true,
        currentPage,
        lastPage: true,
        counter: 0
      },
      async () => {
        //const response = await getResults(user, search);
        const entities = this.allFiles.filter( (et:any) => et.name.indexOf(search) > -1);

        this.setState({
          entities: entities,
          showSpinner: false,
          totalResults: entities.length,
          lastPage: entities.length <= 6
        });
      }
    );
  }

  searchResultsByType(search: any) {
    const { user, onSearchChange } = this.props;
    const { currentPage, showSpinner } = this.state;
    if (showSpinner) {
      return;
    }

    if(this.instance) {
      return this.searchFilesByType(search)
    }

    if (search !== this.props.search) {
      onSearchChange && onSearchChange(search);
    }

    this.setState(
      {
        search: search || '',
        showSpinner: true,
        currentPage,
        lastPage: true,
        counter: 0
      },
      async () => {
        const response = await getResults(user, search);

        this.setState({
          entities: response.data,
          showSpinner: false,
          totalResults: response.data.length,
          lastPage: response.data.length <= 6
        });
      }
    );
  }

  searchResultsByInstance(instance: CentInstance) {
    const { user, onSearchChange } = this.props;
    const { currentPage, showSpinner } = this.state;
    if (showSpinner) {
      return;
    }

    this.setState(
      {
        search: '',
        showSpinner: true,
        currentPage,
        lastPage: true,
        counter: 0
      },
      async () => {
        const response = await getDocumentsByInstance(
          user,
          instance.conceptObjectId
        );

        this.allFiles = [...response.data];
        this.setState({
          entities: response.data,
          showSpinner: false,
          totalResults: response.data.length,
          lastPage: response.data.length <= 6
        });
      }
    );
  }

  renderType(props: any) {
    const icon = props.type === 'dir' ? 'lf-icon-folder' : 'lf-icon-document';
    return <span className={`pager-icon ${icon} new-folder-icon`} />;
  }

  onChangeFile(event: any, data: Document) {
    const { checked } = event;
    const { onChange } = this.props;
    onChange && onChange({ data, checked });
  }

  isFileSelected(data: Document) {
    const { documentObjectId } = data;
    const fd = this.props.files.find((item: Document) => {
      return item.documentObjectId === documentObjectId;
    });
    return fd !== undefined;
  }

  renderOrigin(props: any) {
    const icon = props.type === 'dir' ? 'lf-icon-folder' : 'lf-icon-document';

    console.log(props);
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>
          <CheckBoxComponent
            label=""
            checked={this.isFileSelected(props)}
            cssClass="e-small"
            change={(evt) => {
              this.onChangeFile(evt, props);
            }}
          />
        </span>
        <span className={`table-icon ${icon} new-folder-icon`} />{' '}
      </div>
    );
  }

  renderDate(props: any) {
    const m = moment(props.creationDate).format('YYYY-MM-DD');

    return <span> {m}</span>;
  }

  nodeTemplate(data: any) {
    console.log(data);
    return null;
  }

  render() {
    const { currentPage, entities } = this.state;
    const { instance } = this.props;
    const itemsToShow = entities.slice(
      (currentPage - 1) * 6,
      (currentPage - 1) * 6 + 6
    );

    return (
      <Fragment>
        <div className="step3-container">
          <ol style={{ textAlign: 'center' }}>
            <li className="index-4">
              <span>{i18n.t('modal-attach.q4')}</span>
            </li>
          </ol>

          <section className="panel section-border">
            <div className="panel-right">
              <div className="panel-right-top">
                <span className="section-title"></span>
                  <ImplantationListSearch
                    ref={this.searchRef}
                    closeClassName="search-close-3"
                    searchResultsByType={this.searchResultsByType}
                    countResults={entities.length}
                  ></ImplantationListSearch>
              </div>

              {this.state.showSpinner === true && (
                <div className="spinner">
                  <Spinner />
                </div>
              )}

              <GridComponent
                dataSource={itemsToShow}
                height={'300px'}
                allowSorting={true}
                allowFiltering={true}
                filterSettings={this.FilterOptions}
                selectionSettings={{
                  type: 'Single',
                  mode: 'Row',
                  enableToggle: false
                }}
                locale="es-ES"
              >
                <ColumnsDirective>
                  <ColumnDirective
                    field="contentType"
                    headerText="Formato"
                    allowFiltering={false}
                    width="40"
                    template={this.renderOrigin}
                  ></ColumnDirective>
                  <ColumnDirective
                    field="name"
                    headerText="Título"
                    width="150"
                  ></ColumnDirective>
                  <ColumnDirective
                    field="createdBy"
                    headerText="Autor"
                    width="80"
                  ></ColumnDirective>
                  <ColumnDirective
                    field="creationDate"
                    headerText="Creación"
                    width="50"
                    template={this.renderDate}
                  ></ColumnDirective>
                </ColumnsDirective>
                <Inject services={[Search, Sort]} />
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
          </section>
        </div>

        <style jsx>{`
          .lexon-clasification-list-search .lexon-clasification-list-results {
            margin-top: -6px;
          }

          .step3-container {
            margin: 30px;
          }

          .table-icon {
            font-size: 24px;
            color: #001978;
            margin-left: 20px;
          }

          .e-small.e-checkbox-wrapper .e-frame {
            height: 24px;
            width: 24px;
          }

          .e-small.e-checkbox-wrapper .e-check {
            font-size: 18px;
            padding-top: 6px;
          }

          .e-selectionbackground {
            background-color: #e5e8f1 !important;
          }

          .e-row:hover {
            background-color: #e5e8f1 !important;
          }

          .e-list-text {
            text-transform: none !important;
          }

          .btn-primary:disabled {
            background-color: #001978 !important;
            border-color: #001978 !important;
            color: white !important;
          }

          .new-folder {
            text-align: right;
            font-size: 14px;
            color: #001978 !important;
            height: 26px;
          }

          .new-folder-container {
            cursor: pointer;
            display: inline-block;
            margin-bottom: 5px;
            padding-bottom: 0;
            box-sizing: border-box;
            -moz-box-sizing: border-box;
            -webkit-box-sizing: border-box;
          }

          a.disabled,
          a.disabled span,
          .new-folder-container.disabled,
          a.disabled .new-folder-text {
            color: #d2d2d2 !important;
            cursor: default !important;
          }

          .new-folder-icon {
            margin-right: 0px;
          }

          .new-folder-text {
            font-family: 'MTTMilano-Medium' !important;
            text-decoration: underline;
            line-height: 19px !important;
            font-size: 14px !important;
            color: #001978 !important;
          }

          .add-more:hover .new-folder-text {
            background: none !important;
          }

          .new-folder-text:hover {
            background: none !important;
          }

          .panel {
            display: flex;
            height: 450px;
          }

          .e-rowcell.e-templatecell {
            width: auto;
            display: table-cell;
          }

          .panel-left {
            flex: 1;
          }

          .panel-right {
            flex: 2;
            border-left: 1px solid #e0e0e0;
          }
          .panel-right-top {
            color: red;
            border-bottom: 1px solid #001978;
            height: 46px;
          }

          .section-border {
            position: sticky;
            border: 1px solid #d2d2d2;
            height: 450px;
          }

          .section-title {
            color: #7c868c;
            font-family: 'MTTMilano-Medium' !important;
            font-size: 14px;
            font-weight: 500;
            margin-left: 10px;
            margin-top: 10px;
            text-transform: none;
            vertical-align: text-top;
          }

          .index-4 span {
            margin-left: 8px;
            height: 20px;
            width: 442px;
            color: #7f8cbb;
            font-family: 'MTTMilano-Medium';
            font-size: 20px;
            font-weight: 500;
            line-height: 24px;
          }

          .e-treeview .e-ul,
          .e-treeview .e-text-content {
            padding: 0 0 0 18px;
          }

          .e-list-text {
            text-transform: uppercase;
            color: #001978;
            margin-left: 5px;
          }
          .e-treeview .e-list-item > .e-text-content .e-list-text,
          .e-treeview .e-list-item.e-active > .e-text-content .e-list-text,
          .e-treeview .e-list-item.e-hover > .e-text-content .e-list-text,
          .e-treeview .e-list-item.e-active,
          .e-treeview .e-list-item.e-hover {
            color: #001978 !important;
          }
          .e-treeview .e-list-icon,
          .e-treeview .e-list-img {
            height: auto;
          }
          .e-treeview .e-icon-collapsible,
          .e-treeview .e-icon-expandable {
            color: #001978;
          }
        `}</style>
      </Fragment>
    );
  }
}
