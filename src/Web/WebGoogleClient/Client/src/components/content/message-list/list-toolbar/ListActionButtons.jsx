import React, { PureComponent } from "react";
import { withTranslation } from 'react-i18next';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import './listToolbar.scss';

export class ListActionButtons extends PureComponent {
  constructor(props) {
    super(props);
    this.getClickHandler = this.getClickHandler.bind(this);
    this.trashHandler = this.getClickHandler(["TRASH"]);
  }

  getClickHandler(action) {
    return evt => {
      this.props.onClick(action);
    };
  }

  render() {
    const { t, folder } = this.props;

  if(folder === 'TRASH') {
      return null;
      // (
      // <div>
      //     <div className="action-btn" style={{width: 180, color: '#001978'}} onClick={this.trashHandler}>
      //         <span>{t('message-list.delete-permanently')}</span>
      //     </div>
      // </div>
      // )
  }
    else {
      return (
          <div>
              <div className="action-btn">
                  <FontAwesomeIcon
                      color={'#001978'}
                      title={t('message-list.move-to-trash')}
                      onClick={this.trashHandler}
                      icon={faTrash}
                      size="lg"
                  />
              </div>
          </div>
      );
    }
  }
}

export default withTranslation()(ListActionButtons);
