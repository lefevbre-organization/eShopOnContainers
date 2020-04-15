import React, { Component } from "react";
import "./assigned-to.css";

class AssignedTo extends Component {
  render() {
    return (
      <tr>
        <td>
          <span className="lf-icon-check"></span>2018/000001
        </td>
        <td>Carlos Cuéllar, S.A.</td>
        <td>Expediente de regulación de empleo</td>
      </tr>
    );
  }
}

AssignedTo.propTypes = {};

export default AssignedTo;
