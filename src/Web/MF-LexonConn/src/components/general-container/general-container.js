import React, { Fragment } from "react";
import "./general-container.css";

import SendMessage from "../send-message/SendMessage";
import Main from "../../main";

const GeneralContainer = () => {
  return (
    <Fragment>
      <h1>LEX-ON (mandar mensajes)</h1>
      <div className="container">
        <div className="product-list">
          <SendMessage />
        </div>
      </div>
      <div className="contentpresentation">
        <Main />
      </div>

      {/* <div className="container">
        <div className="left">
          <SendMessage />
        </div>
        <div className="right">
          <Main />
        </div>
      </div> */}
    </Fragment>
  );
};

export default GeneralContainer;
