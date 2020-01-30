import React from "react";
import { useTranslation } from 'react-i18next';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSync,
  
} from "@fortawesome/free-solid-svg-icons";

export default (props) => {
  const { t } = useTranslation();

  return (
      <div className="btn-group ml-auto">
          <button
            onClick={props.getLabelMessagesSynk}
            disabled={false}
            className="btn btn-light bg-white border-1 border-dark px-3 btn-sm"
            title={t('pager-button.refresh')}
          >
            <div>
              <FontAwesomeIcon icon={faSync} />
              <span>{t('synk-button.refresh')}</span>
            </div>
          </button>
      </div>
  );
}