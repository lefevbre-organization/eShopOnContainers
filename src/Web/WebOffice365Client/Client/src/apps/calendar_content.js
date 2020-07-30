import React from "react";
import PropTypes from "prop-types";
import MaterialTitlePanel from "./material_title_panel";
import CalendarCard from "../calendar/components/card/card"

const styles = {
  sidebar: {
    width: 319,
    height: "100%"
  },
  sidebarLink: {
    display: "block",
    padding: "16px 0px",
    color: "#757575",
    textDecoration: "none"
  },
  divider: {
    margin: "8px 0",
    height: 1,
    backgroundColor: "#757575"
  },
  content: {
    padding: 0,
    height: "100%",
    backgroundColor: "#fff"
  }
};

const calendarContent = props => {
  const style = props.style
    ? { ...styles.sidebar, ...props.style }
    : styles.sidebar;

  const { sidebarDocked } = props;

  return (
    <MaterialTitlePanel
      title="CALENDARIO"
      style={style}
      sidebarDocked={sidebarDocked}
    >
      <div style={styles.content}>         
         <CalendarCard />                   
      </div>
    </MaterialTitlePanel>
  );
};

calendarContent.propTypes = {
   style: PropTypes.object
};

export default calendarContent;
