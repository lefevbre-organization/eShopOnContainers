import React, { Component } from "react";
import "./classification-type.css"

class ClassificationType extends Component {
  render() {
    return (
      <div class="form-group">
        <label>
          Tipo<span class="requerido">*</span>
        </label>
        <br />
        <button class="lexon-select-like-custom-trigger">
          Expedientes
          <span class="lf-icon-angle-down"></span>
        </button>
      </div>
    );
  }
}

ClassificationType.propTypes = {};

export default ClassificationType;
