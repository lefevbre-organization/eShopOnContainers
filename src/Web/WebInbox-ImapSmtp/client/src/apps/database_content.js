import React from "react";
import PropTypes from "prop-types";
import MaterialTitlePanel from "./material_title_panel";



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

const databaseContent = props => {
  const style = props.style
    ? { ...styles.sidebar, ...props.style }
    : styles.sidebar;   
  
   
  return (
    <MaterialTitlePanel title="CALENDARIO" style={style}>
      <div style={styles.content}>       
              <img border="0" alt="Lefebvre" src="assets/images/database-fake.png"></img> 
      </div>
    </MaterialTitlePanel>
  );
};




databaseContent.propTypes = {
  style: PropTypes.object
};

export default databaseContent;
