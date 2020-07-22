import React from 'react';
import { RadioButtonComponent } from '@syncfusion/ej2-react-buttons';
import styles from './widgets.scss';
import mainCss from '../../../styles/main.scss';
import { useState } from 'react';

export const ExpirationWidget = ({onChange}) => {
  const [enabled, setEnabled] = useState(false);
  const [option, setOption] = useState(0);
  const [optionSelected, setOptionSelected] = useState(0);
  const [days, setDays] = useState(1);

  return (
    <div className={styles.widget}>
      <div className={styles.p10}>
        <span className={`lf-icon-calendar-cross ${styles['title-icon']}`}></span>
        <span className={styles['generic-title']}>PLAZOS DE EXPIRACIÓN DE FIRMA</span>
        {enabled === false && optionSelected === 0 &&
          <>
            <p className={styles.subtitle}>Actualmente no hay ningún plazo de expiración activado.</p>
            <div className={styles['action-buttons']}>
              <button
                className={`${mainCss['mdc-button']} ${mainCss['mdc-button--unelevated']}  ${styles['action-button']}  ${styles.right}`}
                onClick={() => {
                setEnabled(true);
                }}
              >
                AÑADIR
            </button>
            </div>  
          </>        
        }
        {enabled === false && optionSelected > 0 &&
          <>
            {optionSelected === 1 && <p className={styles.subtitle}>Expirar dentro de {days} días</p>}
            {optionSelected === 2 && <p className={styles.subtitle}>No expirar nunca</p>}

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
                ELIMINAR
              </button>
              <button
                className={`${mainCss['mdc-button']} ${mainCss['mdc-button--unelevated']}  ${styles['action-button']} `}
                onClick={() => {
                  setEnabled(true);
                  setOption(optionSelected);
                }}
              >
                MODIFICAR
              </button>

            </div>
          </>
        }        
        {enabled &&
        <>
          <form action='#'>
            <p className={styles.form}>
              <RadioButtonComponent name="reminder" label='Expirar dentro de ____ días ' checked={option === 1} change={() => {
                setOption(1);
              }}/>
              <span>
                {(option === 1) ? <input type="number" min="1" className={styles["days-input"]} disabled={option !== 1} value={days} onChange={
                  event => {
                    setDays(event.currentTarget.valueAsNumber)
                  }}
                /> : null }
              </span>
              <RadioButtonComponent name="reminder" label='No expirar nunca' checked={option === 2} change={() => {
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
              CANCELAR
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
              ACEPTAR
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
