import React from 'react';
import { RadioButtonComponent } from '@syncfusion/ej2-react-buttons';
import styles from './widgets.scss';
import mainCss from '../../../styles/main.scss';
import { useState } from 'react';
import i18n from 'i18next';

export const ExpirationWidget = ({onChange}) => {
  const [enabled, setEnabled] = useState(false);
  const [option, setOption] = useState(0);
  const [optionSelected, setOptionSelected] = useState(0);
  const [days, setDays] = useState(1);

  return (
    <div className={styles.widget}>
      <div className={styles.p10}>
        <span className={`lf-icon-calendar-cross ${styles['title-icon']}`}></span>
        <span className={styles['generic-title']}>{i18n.t('expirationWidget.title')}</span>
        {enabled === false && optionSelected === 0 &&
          <>
            <p className={styles.subtitle}>{i18n.t('expirationWidget.subtitle')}</p>
            <div className={styles['action-buttons']}>
              <button
                className={`${mainCss['mdc-button']} ${mainCss['mdc-button--unelevated']}  ${styles['action-button']}  ${styles.right}`}
                onClick={() => {
                setEnabled(true);
                }}
              >
                {i18n.t('expirationWidget.addButton')}
            </button>
            </div>  
          </>        
        }
        {enabled === false && optionSelected > 0 &&
          <>
            {optionSelected === 1 && <p className={styles.subtitle}>{i18n.t('expirationWidget.option1').replace('___', days)}</p>}
            {optionSelected === 2 && <p className={styles.subtitle}>{i18n.t('expirationWidget.option2')}</p>}

            <div className={styles['action-buttons']}>
              <button
                className={`${mainCss['mdc-button']} ${mainCss['mdc-button--unelevated']} ${styles['action-button']}  ${styles.cancel}`}
                onClick={() => {
                  setEnabled(false);
                  setOption(0);
                  setOptionSelected(0);

                  if (onChange) {
                    onChange({ option: 0, data: 0 });
                  }
                }}
              >
                {i18n.t('expirationWidget.deleteButton')}
              </button>
              <button
                className={`${mainCss['mdc-button']} ${mainCss['mdc-button--unelevated']}  ${styles['action-button']} `}
                onClick={() => {
                  setEnabled(true);
                  setOption(optionSelected);
                }}
              >
                {i18n.t('expirationWidget.modifyButton')}
              </button>

            </div>
          </>
        }        
        {enabled &&
        <>
          <form action='#'>
            <p className={styles.form}>
              <RadioButtonComponent name="reminder" label={i18n.t('expirationWidget.option1')} checked={option === 1} change={() => {
                setOption(1);
              }}/>
              <span>
                {(option === 1) ? <input type="number" min="1" className={styles["days-input"]} disabled={option !== 1} value={days} onChange={
                  event => {
                    setDays(event.currentTarget.valueAsNumber)
                  }}
                /> : null }
              </span>
              <RadioButtonComponent name="reminder" label={i18n.t('expirationWidget.option2')} checked={option === 2} change={() => {
                setOption(2);
              }}/>
            </p>
          </form>
          <div className={styles['action-buttons']}>
            <button
              className={`${mainCss['mdc-button']} ${mainCss['mdc-button--unelevated']}  ${styles['action-button']}  ${styles.cancel}`}
              onClick={() => {
                setEnabled(false);
                setOption(0);
              }}
            >
              {i18n.t('expirationWidget.cancelButton')}
            </button>
            <button
              className={`${mainCss['mdc-button']} ${mainCss['mdc-button--unelevated']}  ${styles['action-button']} `}
              onClick={() => {
                setEnabled(false);
                (isNaN(days)) ? setOptionSelected(0) : setOptionSelected(option);
                setOption(0);

                onChange && onChange({ option: option, data: days });
              }}
            >
              {i18n.t('expirationWidget.acceptButton')}
            </button>

          </div>
        </>
      }
        {/* <form action='#'>
          <p className={styles.form}>
            <RadioButtonComponent label='Yes' />
            <RadioButtonComponent label='No' />
          </p>
        </form>
        <button
          className={`${mainCss['mdc-button']} ${mainCss['mdc-button--unelevated']} ${styles.right}`}>
          AÑADIR
        </button> */}
      </div>
      <div className='clearfix'></div>
  </div>
  )
};
