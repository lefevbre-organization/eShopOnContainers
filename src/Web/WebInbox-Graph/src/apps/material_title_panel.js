import React from "react";
import PropTypes from "prop-types";
import "./material_title_panel.css";

const styles = {
  root: {
    fontFamily:
      '"HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif',
    fontWeight: 300
  },
  header: {
    backgroundColor: "#001978",
    color: "white",
    padding: "16px",
    fontSize: "16px",
    height: "65px",
    marginLeft: "1px"
  }
};

const MaterialTitlePanel = props => {
  const rootStyle = props.style
    ? { ...styles.root, ...props.style }
    : styles.root;

  const _handleOnClick = () => {
    props.sidebarDocked();
  };

  return (
    <div style={rootStyle}>
      <div style={styles.header}>
        <span>{props.title}</span>
        <img
          className="headerButtons"
          alt={props.title}
          border="0"
          src="assets/img/buttons.png"
          onClick={() => _handleOnClick()}
        ></img>
      </div>
      {props.children}
    </div>
  );
};

MaterialTitlePanel.propTypes = {
  style: PropTypes.object,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  children: PropTypes.object
};

export default MaterialTitlePanel;
