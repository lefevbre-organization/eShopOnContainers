import React from 'react'
import styles from './widgets.scss';
import mainCss from '../../../styles/main.scss';

export const ExpirationWidget = () => {
    return (<div className={styles.widget}>
        <div className={styles['p10']}>
            <span className={"lf-icon-calendar-cross " + styles['title-icon']}></span><span className={styles["generic-title"]}>PLAZOS DE EXPIRACIÓN DE FIRMA</span>
            <form action="#">
                <p className={styles["form"]}>
                    <label>
                        <input className={styles["with-gap"]} name="yourchoice" type="radio" checked="" /><span>Yes</span>
                    </label>
                </p>
                <p class="formulario">
                    <label>
                        <input className={styles["with-gap"]} name="yourchoice" type="radio" /><span>No</span>
                    </label>
                </p>
            </form>
            <button
                className={`${mainCss['mdc-button']} ${mainCss['mdc-button--unelevated']} ${styles['right']}`}>
                AÑADIR
            </button>
        </div>
        <div className="clearfix"></div>
    </div>)
}
