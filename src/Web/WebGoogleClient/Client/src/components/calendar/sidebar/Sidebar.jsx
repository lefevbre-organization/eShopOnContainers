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
        this.newEventClick = this.newEventClick.bind(this);
        this.sidebarAction = this.sidebarAction.bind(this);
    }

    calendarChange(args) { 
        this.props.onCalendarChange(args);       
    }
   
    newEventClick() {       
        this.props.onCalendarOpenEditor();
    }

    navigateToList(evt, calendarId) {
        const calendar = this.props.calendarResult.calendars.find(el => el.id === calendarId);
        this.props.onCalendarClick(calendar.id);
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

        const labelGroups = groupBy(calendars, "accessRole");
        var visibleLabels = [];
        var sortedLabels = [];

        if (labelGroups.owner != null) {
            visibleLabels = labelGroups.owner.filter(
                el =>
                    //el.labelListVisibility === "labelShow" ||
                    //el.labelListVisibility === "labelShowIfUnread" ||
                    !el.labelListVisibility || true
            );
            sortedLabels = sortBy(visibleLabels, "name");
        }

        return (
            <React.Fragment>
                {this.renderMyCalendarView(labelGroups.owner)}
                {this.renderOtherCalendars(labelGroups.reader)}
            </React.Fragment>
        );
    }

    renderMyCalendarView(calendarsOwner) { 
        const { t } = this.props;
        return (
            <React.Fragment>
                <div className='calendar-control-section' style={{ overflow: 'auto' }, { innerWidth: '40%' }, { Height: '40%' }}>
                    <CalendarComponent change={this.calendarChange.bind(this)} ></CalendarComponent>                   
                </div>  
                <li key="olders-nav-title" className="pl-2 nav-title">
                    {t("calendar-sidebar.mycalendars")}
                </li>
                {calendarsOwner.map(el => {
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
                            accessRole={el.accessRole}
                            iconProps={iconProps}
                            selected={el.selected}
                        />
                    );
                })}
                
            </React.Fragment>


        );
    }

    renderOtherCalendars(calendarsOthers) {
        const { t } = this.props;

        return (
            <React.Fragment>
               
                <li key="olders-nav-title" className="pl-2 nav-title">
                    {t("calendar-sidebar.othercalendars")}
                </li>
                {calendarsOthers.map(el => {
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
                            accessRole={el.accessRole}
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
                            <span
                                className="btn font-weight-bold BtnLfcolor uppercase compose-btn"
                                onClick={this.newEventClick}
                            >
                                <img
                                    className="ImgLf"
                                    border="0"
                                    alt="otulook"
                                    src="/assets/img/plus.png"
                                    onClick={this.newEventClick}
                                ></img>
                                {t("calendar-sidebar.compose")}
                            </span>
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
