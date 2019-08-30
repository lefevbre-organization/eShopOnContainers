import React from "react";
import PropTypes from "prop-types";
import MaterialTitlePanel from "./material_title_panel";



const styles = {
  sidebar: {
    width: 320,
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
    padding: "16px",
    height: "100%",
    backgroundColor: "white"
  }
};

const SidebarContent = props => {
  const style = props.style
    ? { ...styles.sidebar, ...props.style }
    : styles.sidebar;
  

  let imgUrl = 'assets/images/settings-gears.svg';

  return (
    <MaterialTitlePanel title="Calendario" style={style}>
      <div style={styles.content}>
        {/*<a href="index.html" style={styles.sidebarLink}>
          Home
        </a>
        <a href="responsive_example.html" style={styles.sidebarLink}>
          Responsive Example
        </a>
        <div style={styles.divider} />
        {links}*/}
       <img border="0" alt="Lefebvre" src="assets/images/calendarfake.png"></img>
      </div>
    </MaterialTitlePanel>
  );
};

SidebarContent.propTypes = {
  style: PropTypes.object
};

export default SidebarContent;
