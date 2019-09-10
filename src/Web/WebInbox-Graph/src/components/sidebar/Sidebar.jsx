import React, { PureComponent } from "react";
import { withTranslation } from 'react-i18next';
import PerfectScrollbar from "react-perfect-scrollbar";
import sortBy from "lodash/sortBy";

import {
  faInbox,
  faEnvelope,
  faTrash,
  faCircle,
  faExclamationCircle,
  faArchive,
  faFolderOpen,
  faChevronLeft
} from "@fortawesome/free-solid-svg-icons";
import LabelItem from "./LabelItem";
import { Link } from "react-router-dom";

import { Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./sidebar.scss";

export class Sidebar extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      selectedLabel: props.pathname,
      selectedFolder: "",      
      leftSideBarOpen: true
    };

    //this.renderLabels = this.renderLabels.bind(this);
      this.navigateToList = this.navigateToList.bind(this);
      this.sidebarAction = this.sidebarAction.bind(this);
  }

  componentDidMount() {
    //this.props.getLabelList(); //.then(labels => {});
    /*  */
    //this.props.getLabelMessages();
  }

  navigateToList(evt, labelId) {
    const label = this.props.labelsResult.labels.find(el => el.id === labelId);
    this.setState({selectedFolder: labelId});
    this.props.onLabelClick(label || { id: "" });
  }

  sidebarAction() {
        this.props.onSidebarCloseClick(this.state.leftSideBarOpen);
  }

  renderItems(labelList) {
    if (labelList.length === 0) {
      return <div />;
    }

    const labels = labelList.reduce((acc, el) => {
      acc.push(el);
      return acc;
    }, []);

      const labelGroups = labels
      //const labelGroups = groupBy(labels, "type");
      //var visibleLabels=[];
      var sortedLabels = [];

      //if (labelGroups.user != null) {      
      //    visibleLabels = labelGroups.user.filter(
      //        el =>
      //            //el.labelListVisibility === "labelShow" ||
      //            //el.labelListVisibility === "labelShowIfUnread" ||
      //            !el.labelListVisibility || true
      //    );
      //   sortedLabels = sortBy(visibleLabels, "name");
      //}

      sortedLabels = sortBy(labels, "displayName");

    //return (
    //  <React.Fragment>
    //    {this.renderFolders(labelGroups)}        
    //    {this.renderLabels(sortedLabels)}
    //  </React.Fragment>
    //);
      return (
          <React.Fragment>             
              {this.renderLabels(sortedLabels)}
          </React.Fragment>
      );

  }

  //  renderFolders(labels) {
  //  const inboxArchive = {
  //    ...labels.find(el => el.id === "ARCHIVE"),
  //    name: "Inbox",
  //    icon: faInbox
  //   };
  //  const inboxLabel = {
  //    ...labels.find(el => el.id === "INBOX"),
  //    name: "Inbox",
  //    icon: faInbox
  //  };
  //  const sentLabel = {
  //    ...labels.find(el => el.id === "SENT"),
  //    messagesUnread: 0,
  //    name: "Sent",
  //    icon: faEnvelope
  //  };
  //  const trashLabel = {
  //    ...labels.find(el => el.id === "TRASH"),
  //    messagesUnread: 0,
  //    name: "Trash",
  //    icon: faTrash
  //  };
  //  const spamLabel = {
  //    ...labels.find(el => el.id === "SPAM"),
  //    name: "Spam",
  //    icon: faExclamationCircle
  //  };

  //  const folders = [inboxLabel, sentLabel, trashLabel, spamLabel];

  //  return (
  //    <React.Fragment>
  //      <li key="olders-nav-title" className="pl-2 nav-title">
  //        Folders
  //      </li>
  //      {folders.map(el => {
  //        const iconProps = { icon: el.icon, size: "lg" };
  //        return (
  //          <LabelItem
  //            key={el.id + "_label"}
  //            onClick={this.navigateToList}
  //            name={el.name}
  //            id={el.id}
  //            messagesUnread={el.messagesUnread}
  //            iconProps={iconProps}
  //            selected={el.selected}
  //          />
  //        );
  //      })}
  //    </React.Fragment>
  //  );
  //}

  
    
   

    renderLabels(labels) {        
      const { t } = this.props;
      let folder = this.state.selectedFolder;

      return (
        <React.Fragment>
          <li key="olders-nav-title" className="pl-2 nav-title">
            <img className="logo-ext" border="0" alt="otulook" src="assets/img/office365.png"></img>
            {t('sidebar.folders')}
          </li>
          {labels.map(el => {
            const iconProps = {
              icon: faFolderOpen,
              color: "#001978",
              size: "lg"
            };            
            if (folder === "") {
              folder = el.id;
            }
            return (
              <LabelItem
                key={el.id + "_label"}
                onClick={this.navigateToList}
                name={el.displayName}
                id={el.id}
                messagesUnread={el.totalItemCount}
                iconProps={iconProps}
                selected={folder === el.id}
              />
            );
          })}
        </React.Fragment>
      );
  }

    render() {

    const collapsed = this.props.sideBarCollapsed;
    const { t } = this.props;

    return (
      <nav id="left-sidebar" className={collapsed ? "d-flex flex-column text-truncate left-panel sidebar-close" : "d-flex flex-column text-truncate left-panel sidebar-open"}>
        <div className="compose-panel">
          <div className="d-flex justify-content-center p-2 compose-btn">
             <div>
                <Link className="btn font-weight-bold BtnLfcolor uppercase compose-btn" to='/compose' >
                   <img className="ImgLf" border="0" alt="otulook" src="assets/img/plus.png"></img>
                   {t('sidebar.compose')}
                </Link>
                <Button
                     onClick={this.props.sideBarToggle}
                     className="btn-transparent margin-right-20">
                     <FontAwesomeIcon icon={faChevronLeft} size="1x" />
                </Button>          
             </div>
          </div>
        </div>
        <PerfectScrollbar
          component="ul"
          className="d-flex flex-column border-0 m-0 sidebar"
        >
          {this.renderItems(this.props.labelsResult.labels)}
        </PerfectScrollbar>
      </nav>
    );
  }
}

export default withTranslation()(Sidebar);
