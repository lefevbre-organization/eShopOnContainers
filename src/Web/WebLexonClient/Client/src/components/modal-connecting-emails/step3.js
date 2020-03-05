import React, { Fragment } from 'react';
import i18n from "i18next";
import { TreeViewComponent } from '@syncfusion/ej2-react-navigations';
import { GridComponent, ColumnsDirective, ColumnDirective } from '@syncfusion/ej2-react-grids';
import Spinner from "../../components/spinner/spinner";
import ClassificationListSearch from "../classify-emails/classification-list-search/classification-list-search";
import { getFolderTree, createFolder } from "../../services/services-lexon";

export class ConnectingEmailsStep3 extends React.Component {
    constructor() {
        super()

        this.state = {
            fields: { dataSource: [], id: 'id', text: 'name', child: 'subChild' },
            entities: [],
            selected: null,
            loadingTree: false
        }

        this.searchResultsByType = this.searchResultsByType.bind(this)
        this.nodeSelected = this.onNodeSelected.bind(this)
        this.nodeSelecting = this.onNodeSelecting.bind(this)
        this.onRowSelected = this.onRowSelected.bind(this)
        this.onNextPage = this.onNextPage.bind(this)
        this.onPrevPage = this.onPrevPage.bind(this)
        this.onCreateFolder = this.onCreateFolder.bind(this)
    }

    async componentDidUpdate(prevProps, prevState) {
        if (JSON.stringify(prevProps.entity) !== JSON.stringify(this.props.entity)) {
            this.setState({ loadingTree: true }, async () => {
                const response = await getFolderTree(this.props.entity.idFolder, this.props.bbdd.bbdd, this.props.user.idUser)
                const tree = normalizeTree(this.props.entity, response.result.data)
                const childs = getChilds(tree, 0)
                this.setState({ loadingTree: false, fields: { dataSource: tree, id: 'id', text: 'name', child: 'subChild' }, entities: childs })
            });
        }

        if (prevProps.show === false && this.props.show === true) {
            const opened = document.getElementsByClassName("lexon-clasification-list-searcher search-close-3 opened")
            if (opened && opened.length > 0) {
                const closeButton = document.getElementsByClassName("search-trigger-hide search-close-3")[0]
                if (closeButton) {
                    closeButton.click();
                }
            }
            return
        }
    }

    onNodeSelected(event) {
        const { onSelectedDirectory } = this.props;

        this.setState({ selected: event.nodeData }, () => {
            onSelectedDirectory && onSelectedDirectory({ selected: parseInt(event.nodeData.id) })
        })
        const node = findNode(this.state.fields.dataSource[0], event.nodeData.id)
        console.log(node)

        // Show children of selected node
        const entities = node.subChild.map(sc => {
            return {
                origin: i18n.t(`classification.${this.props.entity.idType}`),
                name: sc.code || sc.description || "",
                type: "dir",
                modified: "26/09/2019 16:57",
                id: sc.idRelated
            }
        })

        this.setState({ entities })
    }

    onNodeSelecting(event) {
    }

    onNextPage() {
    }

    onPrevPage() {
    }

    async onCreateFolder() {
        if (this.state.selected === null) {
            return;
        }

        const folderName = prompt("Nombre de la carpeta");
        if (folderName) {
            const { idType, idRelated, idFolder } = this.props.entity;
            try {
                this.setState({ loadingTree: true }, async () => {
                    const selectedId = this.state.selected.id;
                    const res = await createFolder(selectedId, folderName, idRelated, idType, this.props.bbdd.bbdd, this.props.user.idUser);
                    const response = await getFolderTree(idFolder, this.props.bbdd.bbdd, this.props.user.idUser)
                    const tree = normalizeTree(this.props.entity, response.result.data)
                    const childs = getChilds(tree, 0)
                    this.setState({ loadingTree: false, fields: { dataSource: tree, id: 'id', text: 'name', child: 'subChild' }, entities: childs })
                })
            } catch (err) {

            }
        }
    }

    onRowSelected(event) {
        const { onSelectedDirectory } = this.props;

        this.setState({ selected: event.data }, () => {
            onSelectedDirectory && onSelectedDirectory({ selected: parseInt(event.data.id) })
        })
    }

    searchResultsByType(type, search) {
        if (search !== "") {
        }
    }

    render() {
        const disabled = this.state.selected === null ? "disabled" : "";
        return <Fragment>
            <div className="step3-container">
                <ol style={{ textAlign: "center" }}>
                    <li className="index-4">
                        <span>{i18n.t(`connecting.q4`)}</span>
                    </li>
                </ol>
                <div className="new-folder">
                    <div className={`new-folder-container ${disabled}`}>
                        <a href="#" class="add-more" onClick={this.onCreateFolder} className={disabled}>
                            <span className="pager-icon lf-icon-folder-new new-folder-icon" />
                            <span className="new-folder-text">Nueva carpeta</span>
                        </a>
                    </div>
                </div>
                <section className="panel section-border">
                    <div className="panel-left">
                        {this.state.loadingTree === true &&
                            <div className="panel-left-spinner-container"><Spinner /></div>
                        }
                        {this.state.loadingTree === false &&
                            <TreeViewComponent fields={this.state.fields} expandOn="Auto" nodeSelected={this.nodeSelected} nodeSelecting={this.onNodeSelecting} />
                        }
                    </div>

                    <div className="panel-right">
                        <div className="panel-right-top">
                            <span className="section-title">{this.props.entity.description}</span>
                            <ClassificationListSearch
                                closeClassName="search-close-3"
                                searchResultsByType={this.searchResultsByType}
                                countResults={-1}
                            ></ClassificationListSearch>
                        </div>
                        {this.state.showSpinner === true &&
                            <div className="spinner"> <Spinner /></div>
                        }

                        <GridComponent ref={g => this.gridRef = g} dataSource={this.state.entities} height={'300px'} selectionSettings={{ type: 'Single', mode: 'Row' }}
                            rowSelected={this.onRowSelected}
                            hideScroll={true}
                            locale="es-ES">

                            <ColumnsDirective>
                                <ColumnDirective field='origin' headerText='Origen' width='100'></ColumnDirective>
                                <ColumnDirective field='name' headerText='Nombre' width='150'></ColumnDirective>
                                <ColumnDirective field='type' headerText='Tipo' width='50'></ColumnDirective>
                                {/* <ColumnDirective field='modified' headerText='Modificación' width='100'></ColumnDirective> */}
                            </ColumnsDirective>
                        </GridComponent>
                        <section className="pager">
                            <div className={`prevButton`} onClick={this.onPrevPage}><span className="pager-icon lf-icon-angle-left" /><span>Anterior</span></div>
                            <div className="currentPage">1</div>
                            <div className={`nextButton`} onClick={this.onNextPage}><span>Siguiente</span><span className="pager-icon lf-icon-angle-right" /></div>
                        </section>
                    </div>
                </section>
            </div>
            <style jsx>{`
                .step3-container {
                    margin: 30px;
                }

                .panel-left-spinner-container {
                    width: 100%;
                    height: 100%;
                }

                .panel-left .preloader-holder-blue {
                    z-index: 1;
                    position: relative;
                    top: 250px;
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
                    font-family: "MTTMilano-Medium" !important;
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

                .e-treeview {
                    width: 250px !important;                    
                }

                .e-treeview .e-ul {
                    overflow: hidden !important;
                }

                .panel-left {
                    flex: 1;                    
                }

                .panel-right {
                    flex: 2;
                    border-left: 1px solid #001978;
                }
                .panel-right-top {
                    color: red;
                    border-bottom: 1px solid #001978;
                    height: 46px;
                }
                
                .section-border {
                    position: sticky;
                    border: 1px solid #D2D2D2;
                    height: 450px;
                }

                .section-title {
                    color: #7C868C;;	
                    font-family: "MTTMilano-Medium" !important;
                    font-size: 14px;	
                    font-weight: 500;
                    margin-left: 10px;
                    margin-top: 10px;
                    text-transform: none;
                    vertical-align: text-top;
                }

                ol>li.index-4::before {
                    content: '4'; 
                    color: #001978;
                    display: inline-block; 
                    width: 1em;
                    margin-left: -1em;
                    background-color: #E5E8F1;
                    border-radius: 50%;
                    height: 32px;
                    width: 32px;
                    text-align: center;
                    font-family: "MTTMilano-Medium";	
                    font-size: 16px;	
                    font-weight: bold;	
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
                .e-treeview .e-list-item.e-active, .e-treeview .e-list-item.e-hover  {
                    color: #001978 !important;
                }
                .e-treeview .e-list-icon, .e-treeview .e-list-img {
                    height: auto;
                }
                .e-treeview .e-icon-collapsible, .e-treeview .e-icon-expandable
                {
                    color: #001978;
                }
            `}
            </style>
        </Fragment>
    }
}

function normalizeTree(entity, data) {
    const root = { ...data, id: data.idRelated, selected: false, name: i18n.t(`classification.${entity.idType}`), expanded: true }

    if (entity.idType === 1) {
        root.imageUrl = `${window.URL_MF_LEXON_BASE}/assets/img/icon-law.png`
    }
    root.subChild = normalizeNodes(root.subChild)

    console.log(root)
    return [root]
}

function normalizeNodes(nodes) {
    const children = []
    for (let i = 0; i < nodes.length; i++) {
        const n = { ...nodes[i], id: nodes[i].idRelated, expanded: true, name: nodes[i].code, imageUrl: `${window.URL_MF_LEXON_BASE}/assets/img/icon-folder.png` };
        if (n.subChild.length > 0) {
            n.subChild = normalizeNodes(n.subChild)
        }
        children.push(n)
    }

    return children;
}

function getChilds(tree, id) {
    const root = tree[0];
    const children = root.subChild;
    for (let i = 0; i < children.length; i++) {
        children[i].type = children[i].idType === 13 ? "dir" : "file";
        children[i].modified = '26/09/2018 16:57';
    }
    return tree.subChilds
}

function findNode(node, id) {
    if (node.id == id) {
        return node;
    }

    for (let i = 0; i < node.subChild.length; i++) {
        const n = findNode(node.subChild[i], id)
        if (n) {
            return n;
        }
    }

    return null;
}
