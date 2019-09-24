import React, { Component } from "react";
import "./select-company.css";
import PropTypes from "prop-types";
import i18n from "i18next";

class SelectCompany extends Component {
  render() {
    return (
      <div className="container">
        <div className="row">
          <form className="col-12 form-selection-business">
            <p>{i18n.t("select-company.select-company")}</p>
            <ul className="list-unstyled">
              <li>
                <input
                  type="radio"
                  name="optionsRadios"
                  id="optionsRadios1"
                  value="option1"
                />
                <label forName="optionsRadios1">
                  <strong>Abogados de Atocha, S.L.</strong>
                </label>
              </li>
              <li>
                <input
                  type="radio"
                  name="optionsRadios"
                  id="optionsRadios2"
                  value="option2"
                />
                <label forName="optionsRadios2">
                  <strong>Servicios Jurídicos Arganzuela</strong>
                </label>
              </li>
              <li>
                <input
                  type="radio"
                  name="optionsRadios"
                  id="optionsRadios3"
                  value="option3"
                />
                <label forName="optionsRadios3">
                  <strong>Barconsa Asesores</strong>
                </label>
              </li>
            </ul>
            <div className="d-flex justify-content-center mt-5">
              <button type="button" className="btn btn-primary text-center">
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

SelectCompany.propTypes = {};

export default SelectCompany;
