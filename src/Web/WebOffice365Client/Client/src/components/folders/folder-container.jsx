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
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PerfectScrollbar from "react-perfect-scrollbar";

const nodeTemplate = (data) => {
    return (
        <div>
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

class FolderContainer extends Component {

    constructor(props) {
        super(props);

        this.tree = [];
        this.state = {
            showTree: false,
            fields: { dataSource: this.props.folderTree.map( f => ({...f, hasChildren: f.childFolderCount > 0})), id: 'id', parentID: 'parentFolderId', text: 'displayName', }
        };
        this.treeViewRef = createRef();
        this.navigateToList = this.navigateToList.bind(this);
    }

    navigateToList(evt) {
        const label = evt.nodeData;
        this.props.onLabelClick(label || { id: "" });
    }

    componentDidUpdate(prevProps) {
         if( JSON.stringify(this.props.folderTree) !== JSON.stringify(prevProps.folderTree)) {
             this.setState({
                 showTree: false,
                 fields: {
                     dataSource: this.props.folderTree.map( f => ({...f, hasChildren: f.childFolderCount > 0})),
                     id: 'id',
                     parentID: 'parentFolderId',
                     text: 'displayName',
                 }
                 }, ()=>{
                 this.setState({showTree: true});
             });
         }
    }

    getDerivedStateFromError() {
        this.setState({
            showTree: true,
            fields: {
                dataSource: this.props.folderTree.map( f => ({...f, hasChildren: f.childFolderCount > 0})),
                id: 'id',
                parentID: 'parentFolderId',
                text: 'displayName',
            }
        });
    }

    componentDidCatch(error, info) {
        // Log the error to an error reporting service
        // logErrorToMyService(error, info);
        console.log(error);
        console.log(info);
    }

    render() {
        const { t } = this.props;
        const { showTree } = this.state;

        return (
            <div className='tree-wrapper'>
                {/*<PerfectScrollbar className="tree-scrollbar">*/}

                <div className="pl-2 nav-title">
                    <img
                        className="logo-ext"
                        border="0"
                        alt="office365"
                        src="/assets/img/office365.png"
                    ></img>
                    {t("sidebar.folders")}
                </div>
                { showTree &&
                    <TreeViewComponent  id='foldertree'
                                        ref={this.treeViewRef}
                        //allowDragAndDrop={true}
                                        fields={this.state.fields}
                        //enablePersistence={true}
                                        nodeSelected={this.navigateToList}
                                        animation={{
                                            expand: {
                                                duration: 100
                                            },
                                            collapse: {
                                                duration: 100
                                            }
                                        }}
                                        nodeTemplate={nodeTemplate}
                    >
                    </TreeViewComponent>
                }
                {/*</PerfectScrollbar>*/}
                <style jsx global>{`
                    .tree-scrollbar {
                        height: calc(100% - 128px);
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



    // showLabel(node) {
    //     if(node.labelListVisibility === 'labelHide') {
    //         return false;
    //     }
    //
    //     if(node.name === 'UNREAD') {
    //         return false;
    //     }
    //
    //     return true;
    // }

    // getIcon(node) {
    //     switch(node.name) {
    //         case "INBOX":
    //             return faInbox;
    //         case "SENT":
    //             return faEnvelopeSquare;
    //         case "TRASH":
    //             return faTrashAlt;
    //         case "SPAM":
    //             return faExclamationTriangle;
    //         case "DRAFT":
    //             return faFile;
    //         case "STARRED":
    //             return faStar;
    //         case "UNREAD":
    //             return faEyeSlash;
    //         case "CHAT":
    //             return faCommentDots;
    //         case "IMPORTANT":
    //             return faBookmark;
    //         case "CATEGORY_PERSONAL":
    //             return faFolder;
    //         case "CATEGORY_FORUMS":
    //             return faFolder;
    //         case "CATEGORY_PROMOTIONS":
    //             return faFolder;
    //         case "CATEGORY_SOCIAL":
    //             return faFolder;
    //         case "CATEGORY_UPDATES":
    //             return faFolder;
    //         default:
    //             return faFolder;
    //     }
    // }

    // getNodeName(folderName) {
    //     const { t } =this.props;
    //     return  folderName;
    //
    //     // const parts = folderName.split("/");
    //     // const name = parts.pop();
    //     //
    //     // switch(name) {
    //     //     case "INBOX":
    //     //         return t("sidebar.inbox");
    //     //     case "SENT":
    //     //         return t("sidebar.sent");
    //     //     case "TRASH":
    //     //         return t("sidebar.trash");
    //     //     case "SPAM":
    //     //         return t("sidebar.spam");
    //     //     case "DRAFT":
    //     //         return t("sidebar.draft");
    //     //     case "STARRED":
    //     //         return t("sidebar.starred");
    //     //     case "UNREAD":
    //     //         return t('sidebar.unread');
    //     //     case "CHAT":
    //     //         return t('sidebar.chat');
    //     //     case "IMPORTANT":
    //     //         return t('sidebar.important');
    //     //     case "CATEGORY_PERSONAL":
    //     //         return t('sidebar.personal');
    //     //     case "CATEGORY_FORUMS":
    //     //         return t('sidebar.forums');
    //     //     case "CATEGORY_PROMOTIONS":
    //     //         return t('sidebar.promotions');
    //     //     case "CATEGORY_SOCIAL":
    //     //         return t('sidebar.social');
    //     //     case "CATEGORY_UPDATES":
    //     //         return t('sidebar.updates');
    //     //     default:
    //     //         return name;
    //     // }
    // }
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
