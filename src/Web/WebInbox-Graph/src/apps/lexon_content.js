import React from "react";
import PropTypes from "prop-types";
import MaterialTitlePanel from "./material_title_panel";
import * as singleSpa from "single-spa";
import { registerLexonApp } from "./lexonconn-app";

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
    backgroundColor: "#fff",
    overflowY: "hidden"
  }
};

const lexonContent = props => {
  const style = props.style
    ? { ...styles.sidebar, ...props.style }
    : styles.sidebar;

  const sidebarDocked = props.sidebarDocked;

  let el = document.getElementById("lexon-app");
  if (!el) {
    try {
      //const activityFunction = location => location.pathname.startsWith('/');
      //registerApplication('lex-on-connector', () => import('../../lex-on_connector/index.js'), activityFunction);
      //start();

      registerLexonApp();
      singleSpa.start();
    } catch (error) {
      singleSpa.unloadApplication("lexon-app", false);
      console.error(error);
    }
  }

  return (
    <MaterialTitlePanel title="LEX-ON" style={style} sidebarDocked={sidebarDocked}>
      <div style={styles.content}>
        {/*<a href="index.html" style={styles.sidebarLink}>
          Home
        </a>
        <a href="responsive_example.html" style={styles.sidebarLink}>
          Responsive Example
        </a>
        <div style={styles.divider} />
        {links}*/}
        {/* <img id="myImg1" onClick={addImg} border="0" alt="Lefebvre" src="assets/img/lexon-1.png"></img> */}

        <div id="lexon-app"></div>
      </div>
    </MaterialTitlePanel>
  );
};

// const addImg = value => {
//   document.getElementById("myImg1").src = "assets/img/lexon-3.png";

//   //document.getElementById("myImg").src = "assets/img/lexon-3.png";
// };

lexonContent.propTypes = {
  style: PropTypes.object
};

export default lexonContent;