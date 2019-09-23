// import React from 'react';
import React, { Component } from "react";
import { connect } from "react-redux";
// import { translate } from "react-i18next";
// import { setMessageFilterKey } from "../../actions/application";
// import MessageFilters, { getFromKey } from "../../services/message-filters";
import styles from "./filter-dialog.scss";
import mainCss from "../../styles/main.scss";
import { removeState } from "../../services/state";
// import { logout } from '../login/login';

import { config } from "../../constants";

class FilterDialogUser extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.routeChange = this.routeChange.bind(this);
  }

  //   routeChange(path) {
  //     this.props.history.push(path);
  //   }

  routeChange() {
    const { userId } = this.props.lexon;
    if (userId !== null) {
      const url = `${config.url.URL_RESET_DEFAULTACCOUNT}/${userId}`;
      fetch(url, {
        method: "GET"
      }).then(result => {
        console.log(result);
      });
    }

    const urlRedirect = `${config.url.URL_SELECT_ACCOUNT}/user/${userId}/encrypt/0`;oji
    window.open(urlRedirect, "_self");
  }

  routeLogout() {
    //removeState();
    //window.location.reload();

    const { userId } = this.props.lexon;
    if (userId !== null) {
      const url = `${config.url.URL_RESET_DEFAULTACCOUNT}/${userId}`;
      fetch(url, {
        method: "GET"
      })
        .then(result => {
          console.log(result);
          removeState();
        })
        .then(_ => {
          const urlRedirect = `${config.url.URL_SELECT_ACCOUNT}/user/${userId}/encrypt/0`;
          window.open(urlRedirect, "_self");
        });
    } else {
      removeState();
      window.location.reload();
    }
  }

  renderSettings() {
    const { userId } = this.props.lexon;
    const displaySettings = userId === null ? false : true;

    if (displaySettings) {
      return (
        <li
          key="1"
          className={`${styles["filter-dialog__item"]} ${
            mainCss["mdc-list-item"]
          }`}
          // onClick={() => this.routeChange(`settings`)}
          onClick={() => this.routeChange()}
        >
          <i
            className={`${styles.check} ${
              styles["check--active"]
            } material-icons`}
          >
            build
          </i>
          Settings
        </li>
      );
    }
    return null;
  }

  render() {
    return (
      <div
        className={`${styles["filter-dialog"]} ${mainCss["mdc-menu"]} ${
          mainCss["mdc-menu-surface"]
        }
                ${this.props.visible ? mainCss["mdc-menu-surface--open"] : ""}`}
        aria-hidden={!this.props.visible}
      >
        <ul className={`${mainCss["mdc-list"]} ${mainCss["mdc-list--dense"]}`}>
          {this.renderSettings()}
          {/* <li
            key="1"
            className={`${styles["filter-dialog__item"]} ${
              mainCss["mdc-list-item"]
            }`}
            // onClick={() => this.routeChange(`settings`)}
            onClick={() => this.routeChange()}
          >
            <i
              className={`${styles.check} ${
                styles["check--active"]
              } material-icons`}
            >
              build
            </i>
            Settings
          </li> */}

          <li
            key="2"
            className={`${styles["filter-dialog__item"]} ${
              mainCss["mdc-list-item"]
            }`}
            onClick={() => this.routeLogout()}
          >
            <i
              className={`${styles.check} ${
                styles["check--active"]
              } material-icons`}
            >
              exit_to_app
            </i>
            Log out
          </li>
        </ul>
      </div>
    );

    // return (
    //    <div className="app flex-row align-items-center">

    //                <div xs="6">
    //            <button color="primary" className="px-4"
    //                        onClick={this.routeChange}
    //                    >
    //                        Login
    //        </button>
    //                </div>
    //                <div xs="6" className="text-right">
    //                    <button color="link" className="px-0">Forgot password?</button>
    //                </div>

    //    </div>
    // );
  }
}

const mapStateToProps = state => ({
  lexon: state.lexon
});

export default connect(mapStateToProps)(FilterDialogUser);

// const mapStateToProps = state => ({
//   activeMessageFilter: getFromKey(state.application.messageFilterKey)
// });

// const mapDispatchToProps = dispatch => ({
//   setMessageFilter: messageFilter =>
//     dispatch(setMessageFilterKey(messageFilter.key))
// });

// export default withRouter(FilterDialogUser);

// export const FilterDialog = ({t, visible, activeMessageFilter, setMessageFilter}) =>
//  <div
//    className={`${styles['filter-dialog']} ${mainCss['mdc-menu']} ${mainCss['mdc-menu-surface']}
//    ${visible ? mainCss['mdc-menu-surface--open'] : ''}`}
//    aria-hidden={!visible}
//  >
//    <ul className={`${mainCss['mdc-list']} ${mainCss['mdc-list--dense']}`} >
//            <li
//                key='1'
//                className={`${styles['filter-dialog__item']} ${mainCss['mdc-list-item']}`}
//                onClick={() => setRedirect()}
//            >
//                <i className={`${styles.check} ${styles['check--active']} material-icons`}>
//                    build
//            </i>
//                Settings
//            </li>

//            <li
//                key='2'
//                className={`${styles['filter-dialog__item']} ${mainCss['mdc-list-item']}`}
//                onClick={() => routeChange()}
//            >
//                <i className={`${styles.check} ${styles['check--active']} material-icons`}>
//                    exit_to_app
//            </i>
//                Log out
//            </li>

//    </ul>
//    </div>;

//const setRedirect = () => {
//    return <Redirect to='/settings' />
//};

//const routeChange = () => {
//    let path = `newPath`;
//    this.props.history.push(path);
//};

//const mapStateToProps = state => ({
//  activeMessageFilter: getFromKey(state.application.messageFilterKey)
//});

//const mapDispatchToProps = dispatch => ({
//  setMessageFilter: messageFilter => dispatch(setMessageFilterKey(messageFilter.key))
//});

//export default connect(mapStateToProps, mapDispatchToProps)(translate()(FilterDialog));
