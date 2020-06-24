import React from 'react'
import styles from './widgets.scss';
import mainCss from '../../../styles/main.scss';

export const RemindersWidget = () => {

    return (<div className={styles.widget}>
        <div className={styles['p10']}>
            <span className={"lf-icon-calendar " + styles['title-icon']}></span><span className={styles["generic-title"]}>RECORDATORIOS PROGRAMADOS</span>
            <p className={styles["subtitle"]}>Actualmente no hay recordatorios programados.</p>

            <button
                className={`${mainCss['mdc-button']} ${mainCss['mdc-button--unelevated']} ${styles['right']}`}>
                AÑADIR
            </button>
        </div>
        <div className="clearfix"></div>
    </div>)
}
