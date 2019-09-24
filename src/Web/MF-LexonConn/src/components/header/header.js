import React from "react";
import "./header.css";
import PropTypes from "prop-types";
import i18n from "i18next";

const Header = ({ title }) => {
  return (
    <header>
      <div className="container">
        <div className="row">
          <h1 className="col-6">{title}</h1>
          <ul className="list-inline col-6 text-right tools-bar">
            <li className="list-inline-item">
              <a href="#" title={i18n.t("select-company.open-all-window")}>
                <strong className="sr-only sr-only-focusable">
                  {i18n.t("select-company.open-all-window")}
                </strong>
                <span className="lf-icon-open-window"></span>
              </a>
            </li>
            <li className="list-inline-item">
              <a href="#" title={i18n.t("select-company.hide-column")}>
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
  );
};

Header.propTypes = {
  title: PropTypes.string.isRequired
};

export default Header;
