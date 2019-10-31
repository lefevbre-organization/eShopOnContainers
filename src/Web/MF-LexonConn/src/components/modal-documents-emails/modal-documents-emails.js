import React, { Component } from "react";
import "./modal-documents-emails.css";
import PropTypes from "prop-types";
import i18n from "i18next";
import { Button, Modal, Container } from "react-bootstrap";
import { connect } from "react-redux";
import ACTIONS from "../../actions/documentsAction";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";

class ModalDocumentsEmails extends Component {
  toggle(event) {
    const { target } = event;
    this.props.updateSelectedCompany(target.value);
  }

  render() {
    const { showModalDocuments, toggleModalDocuments } = this.props;

    return (
      <div>
        <Modal
          show={showModalDocuments}
          onHide={toggleModalDocuments}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          dialogClassName="modal"
        >
          <Modal.Header className="align-items-center" closeButton>
            <h5
              className="modal-title d-flex align-items-center"
              id="documentarGuardardocumentacionLabel"
            >
              <span className="lf-icon-documentation"></span>
              {i18n.t("modal-documents-emails.save-copy")}
            </h5>
          </Modal.Header>
          <Modal.Body>
            <Container>
              <div className="row d-flex justify-content-center">
                <div className="col col-12 p-0">
                  <ul className="row list-unstyled">
                    <li className="col-4">
                      <input
                        type="radio"
                        name="optionsRadioSaveDocument"
                        id="optionsRadios1"
                        value="option1"
                        defaultChecked={true}
                      />
                      <label htmlFor="optionsRadios1">
                        <strong style={{ fontSize: "14px" }}>
                          Guardar mensaje con adjuntos
                        </strong>
                      </label>
                    </li>
                    <li className="col-4">
                      <input
                        type="radio"
                        name="optionsRadioSaveDocument"
                        id="optionsRadios2"
                        defaultChecked={false}
                      />
                      <label htmlFor="optionsRadios2">
                        <strong style={{ fontSize: "14px" }}>
                          Guardar solo mensaje
                        </strong>
                      </label>
                    </li>
                    <li className="col-4">
                      <input
                        type="radio"
                        name="optionsRadioSaveDocument"
                        id="optionsRadios3"
                        defaultChecked={false}
                      />
                      <label htmlFor="optionsRadios3">
                        <strong style={{ fontSize: "14px" }}>
                          Guardar solo adjuntos
                        </strong>
                      </label>
                    </li>
                  </ul>
                  <div className="lexon-documentation-list-container">
                    <div className="form-group">
                      <label>
                        Carpeta de ubicación{" "}
                        <span className="requerido">*</span>
                      </label>
                    </div>
                    <ul className="lexon-documentation-breadcrumb">
                      <li>
                        <a href="#/">Documentación</a>
                      </li>
                      <li>
                        <a href="#/">Contactos</a>
                      </li>
                      <li>Abogados contrarios</li>
                    </ul>
                    <div className="lexon-clasification-list-search">
                      <div className="lexon-clasification-list-results">
                        <p>
                          TOTAL RESULTADOS: <strong>320</strong>
                        </p>
                        <a
                          href="#/"
                          className="search-trigger-show"
                          title="Mostrar buscador"
                        >
                          <strong className="sr-only sr-only-focusable">
                            Mostrar buscador
                          </strong>
                          <span className="lf-icon-search"></span>
                        </a>
                      </div>
                      <div className="lexon-clasification-list-searcher">
                        <label htmlFor="search">
                          <span className="lf-icon-search"></span>
                          <strong className="sr-only sr-only-focusable">
                            Buscar por:
                          </strong>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="search"
                        />
                        <a
                          href="#/"
                          className="search-trigger-hide"
                          title="Ocultar buscador"
                        >
                          <strong className="sr-only sr-only-focusable">
                            Ocultar buscador
                          </strong>
                          <span className="lf-icon-close"></span>
                        </a>
                      </div>
                    </div>
                    <PerfectScrollbar>
                      <ul className="lexon-documentation-list">
                        <li>
                          <span className="lf-icon-law"></span> Expedientes{" "}
                          <span className="lf-icon-angle-right">
                            <strong className="sr-only sr-only-focusable">
                              Acceder a esta carpeta
                            </strong>
                          </span>
                        </li>
                        <li>
                          <span className="lf-icon-contacts"></span> Contactos{" "}
                          <span className="lf-icon-angle-right">
                            <strong className="sr-only sr-only-focusable">
                              Acceder a esta carpeta
                            </strong>
                          </span>
                        </li>
                        <li>
                          <span className="lf-icon-clock"></span> Actuaciones{" "}
                          <span className="lf-icon-angle-right">
                            <strong className="sr-only sr-only-focusable">
                              Acceder a esta carpeta
                            </strong>
                          </span>
                        </li>
                        <li>
                          <span className="lf-icon-money"></span> Facturación{" "}
                          <span className="lf-icon-angle-right">
                            <strong className="sr-only sr-only-focusable">
                              Acceder a esta carpeta
                            </strong>
                          </span>
                        </li>
                        <li>
                          <span className="lf-icon-user"></span> CONTACTOS{" "}
                          <span className="lf-icon-angle-right">
                            <strong className="sr-only sr-only-focusable">
                              Acceder a esta carpeta
                            </strong>
                          </span>
                        </li>

                        <li>
                          <span className="lf-icon-mail"></span> Email{" "}
                          <span className="lf-icon-angle-right">
                            <strong className="sr-only sr-only-focusable">
                              Acceder a esta carpeta
                            </strong>
                          </span>
                        </li>
                        <li>
                          <span className="lf-icon-group"></span> Reuniones{" "}
                          <span className="lf-icon-angle-right">
                            <strong className="sr-only sr-only-focusable">
                              Acceder a esta carpeta
                            </strong>
                          </span>
                        </li>
                        <li>
                          <span className="lf-icon-points"></span> Otras
                          actuaciones{" "}
                          <span className="lf-icon-angle-right">
                            <strong className="sr-only sr-only-focusable">
                              Acceder a esta carpeta
                            </strong>
                          </span>
                        </li>
                        <li>
                          <span className="lf-icon-call"></span> Llamadas{" "}
                          <span className="lf-icon-angle-right">
                            <strong className="sr-only sr-only-focusable">
                              Acceder a esta carpeta
                            </strong>
                          </span>
                        </li>
                        <li>
                          <span className="lf-icon-check-empty"></span> Trámites{" "}
                          <span className="lf-icon-angle-right">
                            <strong className="sr-only sr-only-focusable">
                              Acceder a esta carpeta
                            </strong>
                          </span>
                        </li>
                        <li>
                          <span className="lf-icon-bill"></span> Facturas
                          cliente{" "}
                          <span className="lf-icon-angle-right">
                            <strong className="sr-only sr-only-focusable">
                              Acceder a esta carpeta
                            </strong>
                          </span>
                        </li>
                        <li>
                          <span className="lf-icon-folder"></span> CARPETA{" "}
                          <span className="lf-icon-angle-right">
                            <strong className="sr-only sr-only-focusable">
                              Acceder a esta carpeta
                            </strong>
                          </span>
                        </li>
                        <li>
                          <span className="lf-icon-folder"></span> 2019/000001 -
                          Nombre del Expediente 1{" "}
                          <span className="lf-icon-angle-right">
                            <strong className="sr-only sr-only-focusable">
                              Acceder a esta carpeta
                            </strong>
                          </span>
                        </li>
                        <li className="document">
                          <span className="lf-icon-word"></span> DOCUMENTO WORD
                        </li>
                        <li className="document">
                          <span className="lf-icon-ppt"></span> DOCUMENTO
                          POWERPOINT
                        </li>
                        <li className="document">
                          <span className="lf-icon-excel"></span> DOCUMENTO
                          EXCEL
                        </li>
                      </ul>
                    </PerfectScrollbar>
                    <p className="lexon-clasification-newfolder">
                      <a href="#newfolderConfig">
                        <span className="lf-icon-folder-new"></span>
                        <strong>Nueva carpeta</strong>
                      </a>
                    </p>
                    <div id="newfolderConfig" className="newfolderConfig">
                      <div className="form-group">
                        <label htmlFor="newFolder">
                          Nombre de la nueva carpeta{" "}
                          <span className="requerido">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="newFolder"
                          placeholder="Mi carpeta"
                        />
                      </div>
                      <div className="text-right">
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                        >
                          Cancelar
                        </button>
                        <button type="button" className="btn btn-primary">
                          Crear
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>{" "}
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button
              bsPrefix="btn btn-outline-primary"
              onClick={() => this._handleOnClick(false)}
            >
              {i18n.t("classify-emails.cancel")}
            </Button>
            <Button
              bsPrefix="btn btn-primary"
              onClick={() => this._handleOnClick(true)}
            >
              {i18n.t("classify-emails.save")}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

ModalDocumentsEmails.propTypes = {};

const mapStateToProps = state => {
  return {
    showModalDocuments: state.documentsReducer.showModalDocuments
  };
};

const mapDispatchToProps = dispatch => ({
  toggleModalDocuments: () => dispatch(ACTIONS.toggleModalDocuments())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModalDocumentsEmails);
