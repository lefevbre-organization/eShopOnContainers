import React, { Fragment } from 'react';
import i18n from 'i18next';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Search,
  Sort,
} from '@syncfusion/ej2-react-grids';
import { CheckBoxComponent } from '@syncfusion/ej2-react-buttons';
import { getResults } from '../../services/services-lexon';
import Spinner from '../spinner/spinner';
import ClassificationListSearch from '../classify-emails/classification-list-search/classification-list-search';

export class AttachDocumentsStep4 extends React.Component {
  constructor() {
    super();

    this.state = {
      entities: [],
      selected: null,
      showSpinner: false,
      lastPage: false,
      totalResults: -1,
    };

    this.searchResultsByType = this.searchResultsByType.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.renderType = this.renderType.bind(this);
    this.renderOrigin = this.renderOrigin.bind(this);
    this.onDoubleClick = this.onDoubleClick.bind(this);
    this.onChangeFile = this.onChangeFile.bind(this);
    this.searchRef = React.createRef();
  }

  async componentDidUpdate(prevProps, prevState) {
    const { show, user, bbdd, entity } = this.props;
    const { currentPage } = this.state;

    if (entity !== 14) {
      return;
    }

    if (prevProps.show === false && this.props.show === true) {
      this.setState({ currentPage: 1 }, () => {
        this.searchRef.current.Search(this.props.search);
      });
    }
  }

  nextPage() {
    if (this.state.lastPage === false) {
      const np = this.state.currentPage + 1;
      this.setState({ currentPage: np }, () => {
        this.searchResultsByType(14, this.props.search);
      });
    }
  }

  prevPage() {
    if (this.state.currentPage > 1) {
      const np = this.state.currentPage - 1;
      this.setState({ currentPage: np }, () => {
        this.searchResultsByType(14, this.props.search);
      });
    }
  }

  onDoubleClick(event) {
    this.treeRef && (this.treeRef.selectedNodes = [event.rowData.id]);
  }

  searchResultsByType(type, search) {
    const { user, bbdd, onSearchChange } = this.props;
    const { currentPage, showSpinner } = this.state;
    if (showSpinner) {
      return;
    }

    if (search !== this.props.search) {
      onSearchChange && onSearchChange(search);
    }

    console.log('SearchResultsByType: CurrentPage: ' + this.state.currentPage);
    this.setState(
      {
        search: search || '',
        showSpinner: true,
        currentPage,
        counter: 0,
      },
      async () => {
        const response = await getResults(
          user,
          bbdd,
          14,
          search,
          6,
          currentPage
        );

        const lastPage = currentPage * 6 >= response.results.count;
        this.setState({
          entities: response.results.data,
          showSpinner: false,
          totalResults: response.results.count,
          lastPage,
        });
      }
    );
  }

  renderType(props) {
    const icon = props.type === 'dir' ? 'lf-icon-folder' : 'lf-icon-document';
    return <span className={`pager-icon ${icon} new-folder-icon`} />;
  }

  onChangeFile(event, data) {
    const { checked } = event;
    const { idType, idRelated, code, description, name } = data;
    const { onChange } = this.props;
    onChange &&
      onChange({ idType, idRelated, checked, code: name, description });
  }

  isFileSelected(data) {
    const { idRelated } = data;

    const fd = this.props.files.find((item) => item.idRelated === idRelated);
    return fd !== undefined;
  }

  renderOrigin(props) {
    const icon = this.props.entity.idType === 1 ? 'lf-icon-law' : '';
    console.log(props);
    return (
      <div>
        <span>
          <CheckBoxComponent
            label=''
            checked={this.isFileSelected(props)}
            cssClass='e-small'
            change={(evt) => {
              this.onChangeFile(evt, props);
            }}
          />
        </span>
        <span
          style={{ marginRight: 10, marginLeft: 10 }}
          className={`pager-icon ${icon} new-folder-icon`}></span>
        <span>Expediente</span>
      </div>
    );
  }

  nodeTemplate(data) {
    console.log(data);
    return null;
  }

  render() {
    const { currentPage, totalResults } = this.state;

    return (
      <Fragment>
        <div className='step3-container'>
          <ol style={{ textAlign: 'center' }}>
            <li className='index-4'>
              <span>{i18n.t('modal-attach-documents.select-files')}</span>
            </li>
          </ol>

          <section className='panel section-border'>
            <div className='panel-right'>
              <div className='panel-right-top'>
                <span className='section-title'>
                  {this.props.entity.description}
                </span>
                <ClassificationListSearch
                  ref={this.searchRef}
                  closeClassName='search-close-3'
                  searchResultsByType={this.searchResultsByType}
                  countResults={totalResults}></ClassificationListSearch>
              </div>
              {this.state.showSpinner === true && (
                <div className='spinner'>
                  {' '}
                  <Spinner />
                </div>
              )}

              <GridComponent
                ref={(g) => (this.gridRef = g)}
                dataSource={this.state.entities}
                height={'300px'}
                selectionSettings={{
                  type: 'Single',
                  mode: 'Row',
                  enableToggle: false,
                }}
                allowSorting={true}
                hideScroll={true}
                selected={1}
                recordDoubleClick={this.onDoubleClick}
                locale='es-ES'>
                <ColumnsDirective>
                  <ColumnDirective
                    field='origin'
                    headerText={i18n.t('modal-attach-documents.origin')}
                    width='100'
                    template={this.renderOrigin}></ColumnDirective>
                  <ColumnDirective
                    field='name'
                    headerText={i18n.t('modal-attach-documents.name')}
                    width='150'></ColumnDirective>
                  <ColumnDirective
                    field='type'
                    headerText={i18n.t('modal-attach-documents.type')}
                    width='50'
                    template={this.renderType}></ColumnDirective>
                </ColumnsDirective>
                <Inject services={[Search, Sort]} />
              </GridComponent>
              <section className='pager'>
                <div
                  className={`prevButton ${
                    this.state.currentPage === 1 ? 'disabled' : ''
                  }`}
                  onClick={() => this.prevPage()}>
                  <span className='pager-icon lf-icon-angle-left' />
                  <span>{i18n.t('modal-attach-documents.back')}</span>
                </div>
                <div className='currentPage'>{currentPage}</div>
                <div
                  className={`nextButton ${
                    this.state.lastPage === true ? 'disabled' : ''
                  }`}
                  onClick={() => this.nextPage()}>
                  <span>{i18n.t('modal-attach-documents.next')}</span>
                  <span className='pager-icon lf-icon-angle-right' />
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
