import React, {Component, createRef} from 'react';
import {connect} from 'react-redux';
import {TreeViewComponent} from '@syncfusion/ej2-react-navigations';
import {
    faBookmark,
    faCommentDots,
    faEnvelopeSquare,
    faExclamationTriangle, faEyeSlash,
    faFile, faFolder,
    faInbox,
    faStar,
    faTrashAlt
} from "@fortawesome/free-solid-svg-icons";
import { withTranslation } from "react-i18next";
import * as _ from 'lodash';
import * as uuid from 'uuid/v4';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PerfectScrollbar from "react-perfect-scrollbar";
import {updateLabelName} from "../../api";

const moreId = uuid();

class FolderContainer extends Component {

    constructor(props) {
        super(props);

        this.tree = this.prepareTree();

        this.fields = { dataSource: this.tree, id: 'id', parentID: 'pid', hasChildren: 'hasChild'  };
        this.treeViewRef = createRef();
        this.navigateToList = this.navigateToList.bind(this);
        this.onDropNode = this.onDropNode.bind(this);
        this.onDragStart = this.onDragStart.bind(this);
        this.onNodeExpanded = this.onNodeExpanded.bind(this);
        this.onNodeCollapsed = this.onNodeCollapsed.bind(this);
        this.onNodeClicked = this.onNodeClicked.bind(this);
        this.nodeTemplate = this.nodeTemplate.bind(this);
    }

    navigateToList(evt) {
        const label = evt.nodeData;
        setTimeout(()=>{
            this.props.onLabelClick(label || { id: "" });
        }, 200)
    }

    componentDidUpdate(prevProps) {
        const path = window.location.pathname.replace('/', '');

        if(this.props.folderTree) {
            const newSource = this.prepareTree();

            if(!_.isEqual(this.treeViewRef.current.fields.dataSource, newSource) ) {

                for(let i = 0; i < this.treeViewRef.current.fields.dataSource.length; i++) {
                    const ds = this.treeViewRef.current.fields.dataSource[i];
                    const ns = newSource.find( (it)=> it.id === ds.id );

                    if(ds.id.toLowerCase() === path.toLowerCase()) {
                        ds.selected = true
                    } else {
                        ds.selected = false;
                    }
                    this.treeViewRef.current.fields.dataSource[i] = Object.assign({}, ds, ns, { expanded: ds.expanded, selected: ds.selected});
                }

                setTimeout(()=>{
                    this.treeViewRef.current.refresh();
                });
            }
        }
    }

    onNodeExpanded(node) {
        if(this.toClick) {
            clearTimeout(this.toClick);
            this.toClick = null;
        }

        const ds = this.treeViewRef.current.fields.dataSource.find((it)=> it.id === node.nodeData.id)
        ds.expanded = true;
    }

    onNodeCollapsed(node) {
        if(this.toClick) {
            clearTimeout(this.toClick);
            this.toClick = null;
        }

        const ds = this.treeViewRef.current.fields.dataSource.find((it)=> it.id === node.nodeData.id)
        ds.expanded = false;
    }

    toClick = null;
    onNodeClicked(args) {
        const nodeData = this.treeViewRef.current.getNode(args.node);

        if(nodeData.selected === true) {
            this.toClick = setTimeout(()=>{
                this.navigateToList({nodeData});
            }, 200);

        }
    }

    nodeTemplate(data) {
        return (
            <div className="tree-folder-item">
                <div className="treeviewdiv">
                    <div className="textcontent">
                        <FontAwesomeIcon icon={data.icon} className="label-icon" />
                        <span className="treeName">{data.text || data.name}</span>
                        { data.name !== "SENT" && data.messagesUnread > 0 && <span className="msg-count">{data.messagesUnread}</span> }
                    </div>
                </div>
            </div>
        )
    };

    render() {
        const { t } = this.props;

        return (
            <div className='tree-wrapper'>
                <PerfectScrollbar className="tree-scrollbar">

                <div className="pl-2 nav-title">
                    <img
                        className="logo-ext"
                        border="0"
                        alt="gmail"
                        src="/assets/img/gmail.png"
                    ></img>
                    {t("sidebar.folders")}
                </div>
                    <TreeViewComponent id='foldertree'
                                       ref={this.treeViewRef}
                                        allowDragAndDrop={true}
                                       delayUpdate={true}
                                       fields={this.fields}
                                       loadOnDemand={false}
                                       enablePersistence={false}
                                       cssClass={'folder-tree'}
                                       animation={{
                                           expand: {
                                               duration: 0
                                           },
                                           collapse: {
                                               duration: 0
                                           }
                                       }}
                                       nodeDropped={this.onDropNode}
                                       nodeDragStart={this.onDragStart}
                                       nodeExpanded={this.onNodeExpanded}
                                       nodeCollapsed={this.onNodeCollapsed}
                                       nodeTemplate={this.nodeTemplate}
                                       nodeClicked={this.onNodeClicked}

                    >
                    </TreeViewComponent>
                </PerfectScrollbar>
                <style jsx>{`

                    .tree-scrollbar {
                        height: 100%; //calc(100% - 128px);
                        width: 100%;
                        bottom: 0;                    
                    }
                    
                    .tree-wrapper {
                        height: calc(100% - 77px);
                    }
                    
                    .e-treeview {
                      padding-bottom: 50px;
                    }
                    
                    .e-treeview .e-ul {
                      padding: 0;
                      overflow: hidden;
                    }
                    .e-fullrow {
                        height: 40px !important;
                        border: none !important;
                    }
                    
                    .e-treeview .e-list-item  {
                      padding: 0 !important;
                    }
                    
                    .e-treeview .e-list-item.e-active > .e-fullrow{
                      background-color: #e8f0fe !important;
                    }
                    
                    .e-treeview .e-list-item.e-hover  > .e-fullrow {
                      background-color: #fafafa !important;
                    }
                    
                    .e-treeview .e-list-item.e-hover.e-active  > .e-fullrow {
                      background-color: #e8f0fe !important;
                    }
                                        
                    .e-treeview .e-list-item > .e-text-content .e-list-text {
                        margin-top: 6px;
                    }                                         
          
                    .treeName {
                      color: #001978;
                      margin-left: 20px;
                    }
                    
                    .label-icon {                    
                      position: absolute;
                        top: 10px;
                        left: 22px;
                        font-size: 20px;
                        color: #001978;
                        margin-right: 1rem;
                    }
                    
                    .msg-count {
                        position: absolute;
                        right: 10px;
                        top: 5px;
                        background-color: #e9ecef;
                        color: #000;
                        border-radius: 11px;
                        font-size: .833335rem;
                        padding: 0px 8px 0px;
                    }
                    
                    .nav-title {
                        text-transform: uppercase;
                        font-size: .833335rem;
                        color: #929ba1;
                        padding: 12px 0 6px;
                        font-weight: 600;
                    }
                  `}
                </style>
            </div>
        );
    }

    async onDragStart(event) {
        console.log(event);
        for(let i = 0; i < this.props.folderTree.length; i++) {
            if(this.props.folderTree[i].id === event.draggedNodeData.id) {
                event.draggedNodeData.node = this.props.folderTree[i]
                break;
            }
        }
    }

    async onDropNode(event) {
        const { droppedNodeData, draggedNodeData, dropLevel } = event;

        if(event.draggedNodeData.isMessage) {
            event.cancel = true;
            return;
        } else {
            if(dropLevel <= 1) {
                // Moving folder to parent;
                const newName =  this.getNodeName(draggedNodeData.node.name, true);       //`${draggedNodeData.text}`
                await updateLabelName(draggedNodeData.id, newName);

                if(draggedNodeData.node.hasChild === true) {
                    await this.renameChilds(draggedNodeData.node.name, newName);
                }
                return;
            }

            for(let i = 0; i < this.props.folderTree.length; i++) {
                if(this.props.folderTree[i].id === droppedNodeData.id) {
                    const newName = `${this.props.folderTree[i].name}/${this.getNodeName(draggedNodeData.node.name, true)}`
                    await updateLabelName(draggedNodeData.id, newName);
                    if(draggedNodeData.node.hasChild === true) {
                        await this.renameChilds(draggedNodeData.node.name, newName);
                    }
                }
            }
        }
    }

    async renameChilds(oldName, newName) {
        let nodeId;
        for(let i = 0; i < this.props.folderTree.length; i++) {
            console.log(this.props.folderTree[i].name)
            if (this.props.folderTree[i].name.includes(oldName) && this.props.folderTree[i].name !== oldName) {
                const newNodeName = this.props.folderTree[i].name.replaceAll(oldName, newName);
                nodeId = this.props.folderTree[i].id;
                await updateLabelName(nodeId, newNodeName);
            }
        }
        return true;
    }

    prepareTree() {
        const { t }  = this.props;
        const tree = [...this.props.folderTree];

        tree.push({
            id: moreId,
            name: t('sidebar.more'),
            text: t('sidebar.more'),
            hasChild: true
        })

        for(let i = 0; i < tree.length; i++) {
            const it = tree[i];

            it.icon = this.getIcon(it);

            if(this.showLabel(it) === false){
                it.pid = moreId;
            }

            if(it.name.indexOf("/") > -1) {
              const pid = this.searchParentNode(it, tree);

              if(pid) {
                  it.pid = pid;
              }
            }
        }


        return  _.sortBy(tree.map( it => ({ ...it, text: this.getNodeName(it.name, it.pid)})), ['text']);
    }

    showLabel(node) {
        if(node.labelListVisibility === 'labelHide') {
            return false;
        }

        if(node.name === 'UNREAD') {
            return false;
        }

        return true;
    }

    getIcon(node) {
        switch(node.name) {
            case "INBOX":
                return faInbox;
            case "SENT":
                return faEnvelopeSquare;
            case "TRASH":
                return faTrashAlt;
            case "SPAM":
                return faExclamationTriangle;
            case "DRAFT":
                return faFile;
            case "STARRED":
                return faStar;
            case "UNREAD":
                return faEyeSlash;
            case "CHAT":
                return faCommentDots;
            case "IMPORTANT":
                return faBookmark;
            case "CATEGORY_PERSONAL":
                return faFolder;
            case "CATEGORY_FORUMS":
                return faFolder;
            case "CATEGORY_PROMOTIONS":
                return faFolder;
            case "CATEGORY_SOCIAL":
                return faFolder;
            case "CATEGORY_UPDATES":
                return faFolder;
            default:
                return faFolder;
        }
    }

    searchParentNode(node, tree) {
        const parts = node.name.split("/");
        if(parts.length > 1) {
            parts.pop();
            const parentPath = parts.join('/');

            for(let i = 0; i < tree.length; i++) {
                if(tree[i].name === parentPath) {
                    tree[i].hasChild = true;
                    return tree[i].id;
                }
            }
        }
    }

    getNodeName(folderName, parent) {
        const { t } =this.props;
        const parts = folderName.split("/");
        const name = parts.pop();

        switch(name) {
            case "INBOX":
                return t("sidebar.inbox");
            case "SENT":
                return t("sidebar.sent");
            case "TRASH":
                return t("sidebar.trash");
            case "SPAM":
                return t("sidebar.spam");
            case "DRAFT":
                return t("sidebar.draft");
            case "STARRED":
                return t("sidebar.starred");
            case "UNREAD":
                return t('sidebar.unread');
            case "CHAT":
                return t('sidebar.chat');
            case "IMPORTANT":
                return t('sidebar.important');
            case "CATEGORY_PERSONAL":
                return t('sidebar.personal');
            case "CATEGORY_FORUMS":
                return t('sidebar.forums');
            case "CATEGORY_PROMOTIONS":
                return t('sidebar.promotions');
            case "CATEGORY_SOCIAL":
                return t('sidebar.social');
            case "CATEGORY_UPDATES":
                return t('sidebar.updates');
            default:
                return parent?name:folderName;
        }
    }
}

function mapStateToProps(state) {
    return {};
}

function mapDispatchToProps(dispatch) {
    return {};
}

export default connect(
    mapStateToProps,
    mapDispatchToProps()
)( withTranslation()(FolderContainer));
