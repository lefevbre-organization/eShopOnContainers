import React, { PureComponent } from "react";
import { withTranslation } from "react-i18next";
import './ListFooter.scss';

export class Footer extends PureComponent {
    constructor(props) {
        super(props);
       
    }
    render() {
    const { t } = this.props;

    const { messagesTotal } = this.props;
    let totalLabel = '';
    if (messagesTotal > 0) {
        totalLabel = `${messagesTotal.toLocaleString()}` + " "  + `${ t("message-footer.messages") }`;
    }

    return (
        <div className="mt-auto p-2  list-footer" >
        <div className="d-flex px-4 h-100 align-items-center">
          <div className="total-count">{totalLabel}</div>
          <div className="ml-auto "></div>
        </div>
      </div>
    );
  }
}

export default withTranslation() (Footer);
