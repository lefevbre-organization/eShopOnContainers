import React from "react";
import PropTypes from "prop-types";
import mainCss from "./material_title_panel.scss";

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
    paddingTop: "19px",
    fontSize: "1em",
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
          className={`${mainCss.headerButtons}`}
          border="0"
          src="assets/images/buttons.png"
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
  children: PropTypes.object,
  sidebarDocked: PropTypes.func.isRequired
};

export default MaterialTitlePanel;
