import React, { PureComponent } from "react";
import { withTranslation } from "react-i18next";
import PerfectScrollbar from "react-perfect-scrollbar";
import groupBy from "lodash/groupBy";
import sortBy  from "lodash/sortBy";
import orderBy  from "lodash/orderBy";
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

        this.navigateToList = this.navigateToList.bind(this);
        this.newEventClick = this.newEventClick.bind(this);
        this.sidebarAction = this.sidebarAction.bind(this);

        this.DefaultCalendar = "";
    }

    calendarChange(args) { 
        this.props.onCalendarChange(args);       
    }
   
    newEventClick() {       
        this.props.onCalendarOpenEditor();
    }

    navigateToList(evt, calendarId, checked) {
        const calendar = this.props.calendarResult.calendars.find(el => el.id === calendarId);
        this.props.onCalendarClick(calendar.id, checked);
    }

    sidebarAction() {
        this.props.onSidebarCloseClick(this.state.leftSideBarOpen);
    }

    componentDidUpdate(prevProps, prevState) {
       
        //if (this.state.selectedCalendar === '') {
        //    if (this.props.selectedCalendar !== null) {
        //        this.navigateToList(null, this.props.selectedCalendar.id);
        //    }
        //} else {
        //    if (
        //        prevProps.selectedCalendar !== this.props.selectedCalendar &&
        //        this.props.selectedCalendar !== null
        //    ) {
        //        this.setState({ selectedFolder: this.props.selectedLabel.id });
        //    }
        //}
    }

    //LoaddefaultCalendar() {
    //    this.navigateToList(0, this.DefaultCalendar);
    //}

    renderItems(calendarList) {
        if (calendarList.length === 0) {
            return <div />;
        }

        // find selected calendar to load first  

        const calendars = calendarList.reduce((acc, el) => {
            acc.push(el);
            return acc;
        }, []); 
          
      
        let calendarOrderBy = orderBy(calendars, "primary")
        const calendarGroups = groupBy(calendarOrderBy, "accessRole");
        
        var visibleCalendars = [];
        var sortedCalendars = [];

        if (calendarGroups.owner != null) {
            visibleCalendars = calendarGroups.owner.filter(
                el =>
                    //el.labelListVisibility === "labelShow" ||
                    //el.labelListVisibility === "labelShowIfUnread" ||
                    !el.labelListVisibility || true
            );
            sortedCalendars = sortBy(visibleCalendars, "name");
        }

       
        return (
           <React.Fragment>
             {this.renderMyCalendarView(calendarGroups.owner)}
             {this.renderOtherCalendars(calendarGroups.reader)}
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
                            primary={el.primary}
                        />
                    );
                })}
                
            </React.Fragment>


        );
    }

    renderOtherCalendars(calendarsOthers) {

        if (calendarsOthers != undefined) {

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
