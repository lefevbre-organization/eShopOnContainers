import React, { PureComponent } from "react";
import { withTranslation } from "react-i18next";
import PerfectScrollbar from "react-perfect-scrollbar";
import groupBy from "lodash/groupBy";
import sortBy from "lodash/sortBy";
import {
    faInbox,
    faEnvelopeSquare,
    faTrashAlt,
    faCalendar,
    faExclamationTriangle,
    faChevronLeft
} from "@fortawesome/free-solid-svg-icons";
import CalendarItem from "./CalendarItem";
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

    renderItems(calendarList) {
        if (calendarList.length === 0) {
            return <div />;
        }

        const calendars = calendarList.reduce((acc, el) => {
            acc.push(el);
            return acc;
        }, []);

        const labelGroups = groupBy(calendars, "type");
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
                {this.renderCalendarView()}
                {this.renderCalendars(labelGroups.undefined)}
            </React.Fragment>
        );
    }

    renderCalendarView() { 
        return (
            <React.Fragment>
                <div className='calendar-control-section' style={{ overflow: 'auto' }, { innerWidth: '70%' }}>
                    <CalendarComponent change={this.onchange} ></CalendarComponent>                   
                </div>              
            </React.Fragment>
        );
    }

    renderCalendars(calendars) {
        const { t } = this.props;

        return (
            <React.Fragment>
               
                <li key="olders-nav-title" className="pl-2 nav-title">
                    {t("calendar-sidebar.mycalendars")}
                </li>
                {calendars.map(el => {
                    const iconProps = {
                        icon: faCalendar,
                        color: "#001978",
                        size: "lg"
                    };
                    return (
                        <CalendarItem
                            key={el.id + "_label"}
                            onClick={this.navigateToList}
                            name={el.summary}
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

        const collapsed = this.props.sideBarCollapsed;        

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
                                to='/calendar'
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
                    {this.renderItems(this.props.calendarResult.calendars)}
                </PerfectScrollbar>
            </nav>
        );
    }
}

//export default Sidebar;
export default withTranslation()(Sidebar);
