import React, {Component, createRef} from 'react';
import {connect} from 'react-redux';
import {TreeViewComponent} from '@syncfusion/ej2-react-navigations';
import { withTranslation } from "react-i18next";
import PerfectScrollbar from 'react-perfect-scrollbar';
import {getMessage, moveMessages, updateLabelName} from "../../api_graph";
import * as _ from 'lodash';
import {bindActionCreators} from "redux";
import {
    addMessage, deleteMessage,
    removeMessageFromList
} from "../content/message-list/actions/message-list.actions";

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

        this.onMessageDragEnter = this.onMessageDragEnter.bind(this);
        this.onMessageDragExit = this.onMessageDragExit.bind(this);
        this.onMessageDrop = this.onMessageDrop.bind(this);
        this.onMessageDragOver = this.onMessageDragOver.bind(this);
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

                setTimeout(()=>{
                    const me = this;
                    let items = document.querySelectorAll('.e-treeview li');
                    items.forEach(function(item) {
                        item.addEventListener('dragenter', me.onMessageDragEnter, false);
                        item.addEventListener('dragleave', me.onMessageDragExit, false);
                        item.addEventListener('dragover', me.onMessageDragOver, false);
                        item.addEventListener('drop', me.onMessageDrop, false);
                    });
                }, 1000);
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

    onMessageDragEnter(evt) {
        evt.preventDefault();
        evt.currentTarget.classList.add("message-dragging");
    }

    onMessageDragExit(evt) {
        evt.preventDefault();
        evt.currentTarget.classList.remove("message-dragging");
    }

    async onMessageDrop(evt) {
        evt.preventDefault();
        evt.currentTarget.classList.remove("message-dragging");

        const folderId = evt.currentTarget.getAttribute("data-uid");
        const data = JSON.parse(evt.dataTransfer.getData("text/plain"));

        this.onSelectionChange({
            action: 'uncheck',
            data: [{
                id: data.id
            }]
        });
        this.props.removeMessageFromList(data.id);

        const res = await moveMessages({ ids: [ data.id ], destination: folderId});
    }

    async onSelectionChange(data) {
        const selected = data.action === 'check';
        let msg;
        if(data && data.data && data.data.length >= 1) {
            const { id } = data.data[0];
            console.log(this.props.messagesResult.messages);
            msg = this.props.messagesResult.messages.find( m => m.id === id);
        }

        if(!msg) return;

        const extMessageId = msg.internetMessageId;
        const message = {
            id: msg.id,
            extMessageId,
            subject: msg.subject,
            sentDateTime: msg.sentDateTime,
            folder: this.props.selectedFolder,
            provider: 'OUTLOOK',
            account: this.props.lexon.account,
            chkselected: selected,
            raw: null,
        };

        selected
            ? this.props.addMessage(message)
            : this.props.deleteMessage(message.extMessageId);

        window.dispatchEvent(
            new CustomEvent('Checkclick', {
                detail: message,
            })
        );

        window.dispatchEvent(new CustomEvent('LoadedMessage'));
    }

    onMessageDragOver(evt) {
        evt.preventDefault();
    }


    nodeTemplate(data) {
        let icon = "lf-icon-folder";
        const sf = this.props.specialFolders.find( f => f.id === data.id);
        if(sf) {
            icon = this.getIcon(sf);
        }

        return (
            <div className="tree-folder-item">
                <div className="treeviewdiv">
                    <div className="textcontent">
                        <i className={icon} style={{fontSize: 20, color: '#001978'}}></i>
                        <span className="treeName">{data.displayName}</span>
                        { data.displayName !== "SENT" && data.unreadItemCount > 0 && <span className="msg-count">{data.unreadItemCount}</span> }
                    </div>
                </div>
            </div>
        )
    };

    getIcon(node) {
        switch(node.name) {
            case "inbox":
                return "lf-icon-inbox";
            case "sentitems":
                return "lf-icon-send";
            case "deleteditems":
                return "lf-icon-trash";
            case "junkemail":
                return "lf-icon-alert";
            case "drafts":
                return "lf-icon-document";
            default:
                return "lf-icon-folder";
        }
    }

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
                                       dragArea={"body"}
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
                      margin-left: 10px;
                    }
                    
                    .textcontent {
                        display: flex;
                        align-items: center;
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
                    
                    .message-dragging {
                      background-color: #f9f9f9;
                    }
                  `}
                </style>
            </div>
        );
    }

    nodeDragging(event) {
        if(event.droppedNode === null) {
            event.cancel = true;
            event.dropIndicator = 'e-no-drop';
            return;
        }
        if(event.draggedNodeData.isFolder && event.droppedNode && event.droppedNode.getElementsByClassName('message-row-item') && event.droppedNode.getElementsByClassName('message-row-item').length > 0) {
            event.cancel = true;
            event.dropIndicator = 'e-no-drop';
            return;
        }
        if(event.dropIndicator === 'e-drop-next') {
            event.cancel = true;
            event.dropIndicator = 'e-no-drop';
            return;
        }
    }

    onDragStop(event) {
        if(event.dropIndicator === 'e-no-drop' || (event.draggedNodeData.isFolder && event.droppedNode && event.droppedNode.getElementsByClassName('message-row-item') && event.droppedNode.getElementsByClassName('message-row-item').length > 0)) {
            event.cancel = true;
            event.dropIndicator = 'e-no-drop';
            return;
        }

        if(event.draggedNodeData.isFolder && event.droppedNode === null) {
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
    return {
        specialFolders: state.labelsResult.specialFolders,
        messagesResult: state.messagesResult,
        lexon: state.lexon
        //selectedFolder: state.messagesResult.label
    };
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(
        {
            removeMessageFromList,
            addMessage,
            deleteMessage,
        },
        dispatch
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)( withTranslation()(FolderContainer));
