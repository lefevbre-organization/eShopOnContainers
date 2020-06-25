import React from 'react'
import styles from './widgets.scss';
import mainCss from '../../../styles/main.scss';

export const AttachmentsWidget = () => {

    return (<div className={styles['widget']}>
        <div className={styles['p10']}>
            <span className={"lf-icon-add " + styles['title-icon']}></span><span className={styles["generic-title"]}>Archivos adjuntos</span>
            <p className={styles["subtitle"]}>Acta notarial.pdf <a href="#"><span className={`lf-icon-trash right ${styles["icon-trash"]} ${styles['right']}`}></span> </a></p>
            <button
                className={`${mainCss['mdc-button']} ${mainCss['mdc-button--unelevated']} ${styles['right']}`}>
                adjuntar documento
            </button>
            <div class="clearfix"></div>
        </div>
        <div className={styles["sign"]}>
            <span class="lf-icon-check"></span>
            <a href="#">Firmar documento en una sola hoja</a>
        </div>
        <div class="clearfix"></div>
    </div>)
}
