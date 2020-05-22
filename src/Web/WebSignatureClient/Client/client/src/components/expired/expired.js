import React from "react";
import "./expired.css";

export const Expired = () => {
  return (
    <div className="d-flex w-100 h-100 flex-column justify-content-center align-items-center vertical-center">
      <div className="h1">403 ERROR</div>
      <div>Token expired.</div>
      <div><a target="_self" href="https://www.lex-on.es/">Return to lexon</a></div>
    </div>
  );
};