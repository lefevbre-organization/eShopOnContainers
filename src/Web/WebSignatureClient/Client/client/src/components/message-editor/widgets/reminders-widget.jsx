import React from 'react';
import { RadioButtonComponent } from '@syncfusion/ej2-react-buttons';
import styles from './widgets.scss';
import mainCss from '../../../styles/main.scss';
import { useState } from 'react';
import i18n from 'i18next';


export const RemindersWidget = ({ onChange }) => {
  const [enabled, setEnabled] = useState(false);
  const [option, setOption] = useState(0);
  const [optionSelected, setOptionSelected] = useState(0);
  const [days, setDays] = useState(1);

  return (<div className={styles.widget}>
    <div className={styles.p10}>
      <span className={`lf-icon-calendar ${styles['title-icon']}`}></span><span className={styles["generic-title"]}>{i18n.t('reminderWidget.title')}</span>
      {enabled === false && optionSelected === 0 &&
        <>
          <p className={styles.subtitle}>{i18n.t('reminderWidget.subtitle')}</p>
          <div className={styles['action-buttons']}>
            <button
              className={`${mainCss['mdc-button']} ${mainCss['mdc-button--unelevated']}  ${styles['action-button']}  ${styles.right}`}
              onClick={() => {
                setEnabled(true);
              }}
            >
              {i18n.t('reminderWidget.addButton')}
            </button>
          </div>
        </>
      }
      {enabled === false && optionSelected > 0 &&
        <>
          {optionSelected === 1 && <p className={styles.subtitle}> {i18n.t('reminderWidget.option1').replace('___', days)} </p>}
          {optionSelected === 2 && <p className={styles.subtitle}> {i18n.t('reminderWidget.option2')}</p>}
          {optionSelected === 3 && <p className={styles.subtitle}> {i18n.t('reminderWidget.option3')}</p>}

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
              {i18n.t('reminderWidget.deleteButton')}
            </button>
            <button
              className={`${mainCss['mdc-button']} ${mainCss['mdc-button--unelevated']}  ${styles['action-button']} `}
              onClick={() => {
                setEnabled(true);
                setOption(optionSelected);
              }}
            >
              {i18n.t('reminderWidget.modifyButton')}
            </button>

          </div>
        </>
      }
      {enabled &&
        <>
          <form action='#'>
            <p className={styles.form}>
              <RadioButtonComponent name="reminder" label={i18n.t('reminderWidget.option1')} checked={option === 1} change={() => {
                setOption(1);
              }} />
              <span>
                {(option === 1) ? 
                  <input type="number" min="1" className={styles["days-input"]} disabled={option !== 1} value={days} onChange={
                    event => {
                      setDays(event.currentTarget.valueAsNumber)
                    }
                  }></input>
                : null}
              </span>
              <RadioButtonComponent name="reminder" label={i18n.t('reminderWidget.option2')} checked={option === 2} change={() => {
                setOption(2);
              }} />
              <RadioButtonComponent name="reminder" label={i18n.t('reminderWidget.option3')} checked={option === 3} change={() => {
                setOption(3);
              }} />
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
              {i18n.t('reminderWidget.cancelButton')}
            </button>
            <button
              className={`${mainCss['mdc-button']} ${mainCss['mdc-button--unelevated']}  ${styles['action-button']} `}
              onClick={() => {
                setEnabled(false);
                setOptionSelected(option);
                setOption(0);

                onChange && onChange({ option: option, data: days });
              }}
            >
              {i18n.t('reminderWidget.acceptButton')}
            </button>

          </div>
        </>
      }
    </div>
    <div className="clearfix"></div>
  </div>);
};

