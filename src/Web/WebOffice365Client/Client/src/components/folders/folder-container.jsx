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
import PerfectScrollbar from 'react-perfect-scrollbar';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {updateLabelName} from "../../api_graph";
import * as _ from 'lodash';

class FolderContainer extends Component {
    constructor(props) {
        super(props);
        this.tree = [];
        this.fields = { dataSource: this.props.folderTree.map( f => ({...f, hasChildren: f.childFolderCount > 0})), id: 'id', parentID: 'parentFolderId', text: 'displayName', };
        this.treeViewRef = createRef();
        this.navigateToList = this.navigateToList.bind(this);
        this.onDropNode = this.onDropNode.bind(this);
        this.onNodeExpanded = this.onNodeExpanded.bind(this);
        this.onNodeCollapsed = this.onNodeCollapsed.bind(this);
        this.onNodeClicked = this.onNodeClicked.bind(this);
        this.nodeTemplate = this.nodeTemplate.bind(this);
        this.onNodeSelecting = this.onNodeSelecting.bind(this);
        this.nodeDragging = this.nodeDragging.bind(this);
        this.onDragStop = this.onDragStop.bind(this);
        this.onDragStart= this.onDragStart.bind(this);
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
            const newSource = this.props.folderTree.map( f => ({...f, hasChildren: f.childFolderCount > 0}));

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

    onNodeSelecting(node) {
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
                        <FontAwesomeIcon icon={faFolder} className="label-icon" />
                        <span className="treeName">{data.displayName}</span>
                        { data.displayName !== "SENT" && data.unreadItemCount > 0 && <span className="msg-count">{data.unreadItemCount}</span> }
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
                        alt="office365"
                        src="/assets/img/office365.png"
                    ></img>
                    {t("sidebar.folders")}
                </div>
                    <TreeViewComponent id='foldertree'
                                       ref={this.treeViewRef}
                                       allowDragAndDrop={true}
                                       fields={this.fields}
                                       enablePersistence={false}
                                       cssClass={'folder-tree'}
                                       delayUpdate={true}
                                       loadOnDemand={false}
                                       nodeExpanded={this.onNodeExpanded}
                                       nodeCollapsed={this.onNodeCollapsed}
                                       nodeTemplate={this.nodeTemplate}
                                       nodeClicked={this.onNodeClicked}
                                       nodeDropped={this.onDropNode}
                                       nodeDragStart={this.onDragStart}
                                       nodeDragStop={this.onDragStop}
                                       nodeDragging={this.nodeDragging}
                                       animation={{
                                           expand: {
                                               duration: 0
                                           },
                                           collapse: {
                                               duration: 0
                                           }
                                       }}
                    >
                    </TreeViewComponent>
                </PerfectScrollbar>
                <style jsx global>{`
                    .tree-scrollbar {
                        height: calc(100%);
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

    nodeDragging(event) {
        if(event.draggedNodeData.isFolder && event.droppedNode && event.droppedNode.getElementsByClassName('message-row-item') && event.droppedNode.getElementsByClassName('message-row-item').length > 0) {
            event.cancel = true;
            event.dropIndicator = 'e-no-drop';
        }
    }

    onDragStop(event) {
        if(event.draggedNodeData.isFolder && event.droppedNode && event.droppedNode.getElementsByClassName('message-row-item') && event.droppedNode.getElementsByClassName('message-row-item').length > 0) {
            event.cancel = true;
            event.dropIndicator = 'e-no-drop';
        }
    }

    onDragStart(event) {
        event.draggedNodeData.isFolder = true;
        if(event.draggedNodeData.isFolder && event.droppedNode && event.droppedNode.getElementsByClassName('message-row-item') && event.droppedNode.getElementsByClassName('message-row-item').length > 0) {
            event.cancel = true;
            event.dropIndicator = 'e-no-drop';
        }
    }

    async onDropNode(event) {
        const { droppedNodeData, draggedNodeData,dropLevel } = event;

        if(event.draggedNodeData.isMessage) {
            event.cancel = true;
            return;
        } else {
            if (dropLevel <= 1) {
                // Moving folder to parent;
                await updateLabelName(draggedNodeData.id, null);
                return;
            }
            for (let i = 0; i < this.props.folderTree.length; i++) {
                if (this.props.folderTree[i].id === droppedNodeData.id) {
                    await updateLabelName(draggedNodeData.id, this.props.folderTree[i].id);
                }
            }
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
