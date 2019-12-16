import React, { Component } from "react";
import { connect } from "react-redux";
import { translate } from "react-i18next";
import PropTypes from "prop-types";
import FolderContainer from "../folders/folder-container";
import { DroppablePayloadTypes } from "../folders/folder-list";
import IconButton from "../buttons/icon-button";
import { moveFolder } from "../../services/folder";
import mainCss from "../../styles/main.scss";
import styles from "./side-bar.scss";
import { editNewMessage } from "../../services/application";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";

class SideBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dragOver: false
    };
    this.handleOnDragOver = this.onDragOver.bind(this);
    this.handleOnDragLeave = this.onDragLeave.bind(this);
    this.handleOnDrop = this.onDrop.bind(this);
  }

  render() {
    const { t, collapsed } = this.props;
    const { dragOver } = this.state;
    return (
      <aside
        onDragOver={this.handleOnDragOver}
        onDragLeave={this.handleOnDragLeave}
        onDrop={this.handleOnDrop}
        className={`${styles["side-bar"]}
          ${mainCss["mdc-drawer"]}
          ${mainCss["mdc-drawer--dismissible"]}
          ${SideBar.getCollapsedClassName(collapsed)}
          ${dragOver ? styles.dropZone : ""}`}
      >
        <div
          className={`${mainCss["mdc-drawer__header"]} ${
            styles["top-container"]
          } ${styles["divheader"]}`}
        >
          {/*{(location.protocol !== 'https:' &&
            <span className='material-icons' isotip={t('sideBar.errors.noSSL')}
              isotip-position='bottom-start' isotip-size='small'>
            lock_open
            </span>)}*/}
          {this.props.errors.diskQuotaExceeded && (
            <span
              className="material-icons"
              isotip={t("sideBar.errors.diskQuotaExceeded")}
              isotip-position="bottom-start"
              isotip-size="small"
            >
              disc_full
            </span>
          )}
          {/* <img className={styles.logo} border="0" alt="Lefebvre" src="assets/images/logo-elderecho.png"></img>*/}
          <button
            style={{ height: 48 }}
            className={`${mainCss["mdc-button"]}
                    ${mainCss["mdc-button"]} ${styles["compose"]}`}
            onClick={this.props.newMessage.bind(this)}
          >
            {/* <i className='material-icons mdc-button__icon' style={{ fontSize: 48 }}>add_circle_outline</i>*/}
            <img
              className={styles.plusbuttton}
              border="0"
              src="assets/images/plus.png"
            ></img>
            <span className="mdc-button__label" style={{ fontSize: 10.6 }}>
              {t("sideBar.compose")}
            </span>
          </button>
          <span
            className={styles.toggle}
            isotip={t("sideBar.hide")}
            isotip-position="bottom-end"
            isotip-size="small"
          >
            <IconButton onClick={this.props.sideBarToggle}>
              keyboard_arrow_left
            </IconButton>
          </span>
        </div>
        <PerfectScrollbar>
          <FolderContainer />
        </PerfectScrollbar>
      </aside>
    );
  }

  onDragOver(event) {
    event.preventDefault();
    if (
      event.dataTransfer.types &&
      Array.from(event.dataTransfer.types).includes("application/json")
    ) {
      this.setState({ dragOver: true });
    }
  }

  onDragLeave(event) {
    event.preventDefault();
    this.setState({ dragOver: false });
  }

  onDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    this.setState({ dragOver: false });
    if (
      event.dataTransfer.types &&
      Array.from(event.dataTransfer.types).includes("application/json")
    ) {
      const payload = JSON.parse(
        event.dataTransfer.getData("application/json")
      );
      if (payload.type === DroppablePayloadTypes.FOLDER) {
        this.props.moveFolderToFirstLevel(payload.folder);
      }
    }
  }

  static getCollapsedClassName(collapsed) {
    return collapsed ? "" : `${styles.open} ${mainCss["mdc-drawer--open"]}`;
  }
}

SideBar.propTypes = {
  t: PropTypes.func.isRequired,
  sideBarToggle: PropTypes.func.isRequired,
  collapsed: PropTypes.bool.isRequired,
  application: PropTypes.object,
  errors: PropTypes.object,
  newMessage: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  application: state.application,
  errors: state.application.errors,
  lexon: state.lexon
});

const mapDispatchToProps = dispatch => ({
  moveFolderToFirstLevel: (user, folder) =>
    moveFolder(dispatch, user, folder, null),
  newMessage: () => editNewMessage(dispatch)
});

const mergeProps = (stateProps, dispatchProps, ownProps) =>
  Object.assign({}, stateProps, dispatchProps, ownProps, {
    moveFolderToFirstLevel: folder =>
      dispatchProps.moveFolderToFirstLevel(stateProps.application.user, folder)
  });

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(translate()(SideBar));
