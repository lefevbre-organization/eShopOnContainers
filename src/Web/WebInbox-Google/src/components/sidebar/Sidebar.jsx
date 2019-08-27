import React, { PureComponent } from "react";
import { withTranslation } from 'react-i18next';

import ComposeMessage from "../compose-message/ComposeMessage";
import PerfectScrollbar from "react-perfect-scrollbar";

import groupBy from "lodash/groupBy";
import sortBy from "lodash/sortBy";

import {
  faInbox,
  faEnvelopeSquare,
  faTrashAlt,
  faFolderOpen,
  faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";

import LabelItem from "./LabelItem";

import "./sidebar.scss";

export class Sidebar extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      selectedLabel: props.pathname
    };

    //this.renderLabels = this.renderLabels.bind(this);
    this.navigateToList = this.navigateToList.bind(this);
  }

  componentDidMount() {
    //this.props.getLabelList(); //.then(labels => {});
    /*  */
    //this.props.getLabelMessages();
  }

  navigateToList(evt, labelId) {
    const label = this.props.labelsResult.labels.find(el => el.id === labelId);
    this.props.onLabelClick(label || { id: "" });
  }

  renderItems(labelList) {
    if (labelList.length === 0) {
      return <div />;
    }

    const labels = labelList.reduce((acc, el) => {
      acc.push(el);
      return acc;
    }, []);

      const labelGroups = groupBy(labels, "type");
      var visibleLabels=[];
      var sortedLabels = [];

      if (labelGroups.user != null) {      
          visibleLabels = labelGroups.user.filter(
              el =>
                  //el.labelListVisibility === "labelShow" ||
                  //el.labelListVisibility === "labelShowIfUnread" ||
                  !el.labelListVisibility || true
          );
         sortedLabels = sortBy(visibleLabels, "name");
      }

    return (
      <React.Fragment>
        {this.renderFolders(labelGroups.system)}
        {this.renderLabels(sortedLabels)}
      </React.Fragment>
    );
  }

  renderFolders(labels) {
    const { t } = this.props;

    const inboxLabel = {
      ...labels.find(el => el.id === "INBOX"),
      name: t('sidebar.inbox'),
      icon: faInbox
    };
    const sentLabel = {
      ...labels.find(el => el.id === "SENT"),
      messagesUnread: 0,
      name: t('sidebar.sent'),
      icon:  faEnvelopeSquare
    };
    const trashLabel = {
      ...labels.find(el => el.id === "TRASH"),
      messagesUnread: 0,
      name: t('sidebar.trash'),
      icon:faTrashAlt

    };
    const spamLabel = {
      ...labels.find(el => el.id === "SPAM"),
      name: t('sidebar.spam'),
      icon: faExclamationTriangle
    };

    const folders = [inboxLabel, sentLabel, trashLabel, spamLabel];

    return (
      <React.Fragment>
        <li key="olders-nav-title" className="pl-2 nav-title">
            <img className="logo-ext" border="0" alt="otulook" src="assets/img/gmail.png"></img>
            {t('sidebar.folders')}
        </li>
        {folders.map(el => {
          const iconProps = { icon: el.icon, size: "lg" };
          return (
            <LabelItem
              key={el.id + "_label"}
              onClick={this.navigateToList}
              name={el.name}
              id={el.id}
              messagesUnread={el.messagesUnread}
              iconProps={iconProps}
              selected={el.selected}
            />
          );
        })}
      </React.Fragment>
    );
  }

  renderLabels(labels) {
    const { t } = this.props;

    return (
      <React.Fragment>
        <li key="olders-nav-title" className="pl-2 nav-title">
          {t('sidebar.labels')}
        </li>
        {labels.map(el => {
          const iconProps = {
            icon: faFolderOpen,
            color: "#001978",
            size: "lg"
          };
          return (
            <LabelItem
              key={el.id + "_label"}
              onClick={this.navigateToList}
              name={el.name}
              id={el.id}
              messagesUnread={el.messagesUnread}
              iconProps={iconProps}
              selected={el.selected}
            />
          );
        })}
      </React.Fragment>
    );
  }

  render() {
    const { t } = this.props;
    
    return (
      <nav className="d-flex flex-column text-truncate left-panel">
        <div className="compose-panel">
          <div className="d-flex justify-content-center p-2 compose-btn">
            <ComposeMessage
              subject=""
              to=""
            >
              <button className="btn font-weight-bold BtnLfcolor uppercase">
                <img className="ImgLf" border="0" alt="otulook" src="assets/img/plus.png"></img> 
                <span className="text-dark">{t('sidebar.compose')}</span>

              </button>
            </ComposeMessage>
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

//export default Sidebar;
export default withTranslation()(Sidebar);
