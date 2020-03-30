import React, { PureComponent } from "react";
import { withTranslation } from "react-i18next";
import PerfectScrollbar from "react-perfect-scrollbar";
import groupBy from "lodash/groupBy";
import sortBy from "lodash/sortBy";
import {
  faInbox,
  faEnvelopeSquare,
  faTrashAlt,
  faFolderOpen,
  faExclamationTriangle,
  faChevronLeft
} from "@fortawesome/free-solid-svg-icons";
import LabelItem from "./LabelItem";
import { Link } from "react-router-dom";
import { Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { CalendarComponent, ChangedEventArgs } from '@syncfusion/ej2-react-calendars';

import "./sidebar.scss";

export class Sidebar extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      selectedLabel: props.pathname,
      leftSideBarOpen: true
    };

    //this.renderLabels = this.renderLabels.bind(this);
    this.navigateToList = this.navigateToList.bind(this);
    this.composeClick = this.composeClick.bind(this);
    this.sidebarAction = this.sidebarAction.bind(this);
  }

  componentDidMount() {
    //this.props.getLabelList(); //.then(labels => {});
    /*  */
    //this.props.getLabelMessages();
  }

  composeClick() {
    this.props.history.push("/compose");
  }

  navigateToList(evt, labelId) {
    const label = this.props.labelsResult.labels.find(el => el.id === labelId);
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

    const labelGroups = groupBy(labels, "type");
    var visibleLabels = [];
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
      name: t("sidebar.inbox"),
      icon: faInbox
    };
    const sentLabel = {
      ...labels.find(el => el.id === "SENT"),
      messagesUnread: 0,
      name: t("sidebar.sent"),
      icon: faEnvelopeSquare
    };
    const trashLabel = {
      ...labels.find(el => el.id === "TRASH"),
      messagesUnread: 0,
      name: t("sidebar.trash"),
      icon: faTrashAlt
    };
    const spamLabel = {
      ...labels.find(el => el.id === "SPAM"),
      name: t("sidebar.spam"),
      icon: faExclamationTriangle
    };

   
  }

  renderLabels(labels) {
    const { t } = this.props;

    return (
      <React.Fragment>       
            <div className='calendar-control-section' style={{ overflow: 'auto' }, { innerWidth: '70%' }}>
                <CalendarComponent change={this.onchange} ></CalendarComponent>
                <label id='date_label'>Selected Value:</label>
            </div>
      </React.Fragment>
    );
  }

  render() {
    const { t } = this.props;

    const collapsed = this.props.sideBarCollapsed;

    const composeProps = {
      subject: "",
      to: "",
      content: ""
    };

    return (
      //${ collapsed ? '' : styles['with-side-bar'] }
      <nav
        id="left-sidebar"
        className={
          collapsed
            ? "d-flex flex-column text-truncate left-panel sidebar-close"
            : "d-flex flex-column text-truncate left-panel sidebar-open"
        }
      >
        <div className="compose-panel">
          <div className="d-flex justify-content-center p-2 compose-btn">
            <div className="compose-div">
              <Link
                className="btn font-weight-bold BtnLfcolor uppercase compose-btn"
                to={{
                  pathname: "/compose",
                  search: "",
                  state: { composeProps }
                }}
              >
                <img
                  className="ImgLf"
                  border="0"
                  alt="otulook"
                  src="assets/img/plus.png"
                ></img>
                {t("calendar-sidebar.compose")}
              </Link>
              <Button
                onClick={this.props.sideBarToggle}
                className="btn-transparent margin-right-20 float-right margin-top-10"
              >
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

//Sidebar.propTypes = {
//    sideBarToggle: PropTypes.func.isRequired,
//    collapsed: PropTypes.bool.isRequired
//};

//export default Sidebar;
export default withTranslation()(Sidebar);
