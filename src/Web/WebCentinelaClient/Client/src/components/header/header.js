import React, { Fragment } from "react";
import PropTypes from "prop-types";
import i18n from "i18next";

const Header = ({ title }) => {
  return (
    <Fragment>
    <header>
      <div className="container">
        <div className="row">
          <h1 className="col-6">{title}</h1>
          <ul className="list-inline col-6 text-right tools-bar">
            <li className="list-inline-item">
              <a href="#/" title={i18n.t("select-company.open-all-window")}>
                <strong className="sr-only sr-only-focusable">
                  {i18n.t("select-company.open-all-window")}
                </strong>
                <span className="lf-icon-open-window"></span>
              </a>
            </li>
            <li className="list-inline-item">
              <a href="#/" title={i18n.t("select-company.hide-column")}>
                <strong className="sr-only sr-only-focusable">
                  {i18n.t("select-company.hide-column")}
                </strong>
                <span className="lf-icon-close"></span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </header>

    <style jsx>{`
      header {
        height: 60px;
        width: 319px;
        border: 1px solid #000000;
        background-color: #001978;
        position: fixed;
        top: 0;
      }
      header h1 {
        font-size: 16px;
        font-weight: bold;
        line-height: 18px;
        color: #ffffff;
        padding-top: 20px;
      }
      
      header .tools-bar {
        padding-top: 10px;
      }
      
      header .tools-bar a {
        color: #ffffff;
        font-size: 20px;
        display: block;
        width: 34px;
        height: 34px;
        padding: 7px;
        transition: background-color 0.3ms;
        border-radius: 50%;
      }
      header .tools-bar a:hover {
        background-color: #e5e8f1;
        color: #001978;
      }
      `}</style>
    </Fragment>
  );
};

Header.propTypes = {
  title: PropTypes.string.isRequired
};

export default Header;
