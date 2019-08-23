import React from "react";
import { useTranslation } from 'react-i18next';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight
} from "@fortawesome/free-solid-svg-icons";

export default (props) => {
  const { t } = useTranslation();

  return (
    <div className="btn-group ml-auto">
      <button
        onClick={props.navigateToPrevPage}
        disabled={props.prevToken == null}
        className="btn btn-light bg-white border-1 border-dark px-3 btn-sm"
        title={t('pager-buttons.previous-page')}
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
      <button
        onClick={props.navigateToNextPage}
        disabled={props.nextToken == null} 
        className="btn btn-light bg-white border-1  border-dark px-3 btn-sm"
        title={t('pager-buttons.next-page')}
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </div>
  );
}