import React, { Fragment } from 'react';
import { CheckBoxComponent, RadioButtonComponent } from '@syncfusion/ej2-react-buttons';
import { getTypes } from '../../services/services-lexon'

export class ConnectingEmailsStep1 extends React.Component {
    constructor() {
        super()
    }



    async componentDidMount() {
        const types = await getTypes();
    }

    render() {
        return <Fragment>
            <div className="step1-container">
            <ol> 
                <li>
                    <span>¿Que quieres hacer con los mensajes seleccionados?</span>
                    <ul>
                        <li><CheckBoxComponent label="Crear actuación"/></li>
                        <li><CheckBoxComponent disabled label="Guardar copia de los mensajes en documentación"/></li>
                        <li><CheckBoxComponent disabled label="Guardar los archivos adjuntos en documentación"/></li>
                    </ul>
                </li>
                <li>
                    <span>Con que tipo de entidad quieres conectarlos?</span>
                    <ul className="two-columns">
                        <li><RadioButtonComponent cssClass="e-primary" label="Expediente"/></li>
                        <li><RadioButtonComponent cssClass="e-primary" label="Cliente"/></li>
                        <li><RadioButtonComponent cssClass="e-primary" label="Abogado propio"/></li>
                        <li><RadioButtonComponent cssClass="e-primary" label="Procurador propio"/></li>
                        <li><RadioButtonComponent cssClass="e-primary" label="Notario"/></li>
                        <li><RadioButtonComponent cssClass="e-primary" label="Otros contactos"/></li>
                        <li><RadioButtonComponent cssClass="e-primary" label="Contrario"/></li>
                        <li><RadioButtonComponent cssClass="e-primary" label="Abogado contrario"/></li>
                        <li><RadioButtonComponent cssClass="e-primary" label="Procurador contrario"/></li>
                        <li><RadioButtonComponent cssClass="e-primary" label="Juzgado"/></li>

                    </ul>
                </li>
            </ol>
            </div>
            <style jsx>{`
                .step1-container {
                    margin: 50px;
                }
                ol {list-style: none; counter-reset: li;}
                ol>li::before {
                    content: counter(li); 
                    color: #001978;
                    display: inline-block; 
                    width: 1em;
                    margin-left: -1em;
                    background-color: #E5E8F1;
                    border-radius: 50%;
                    height: 32px;
                    width: 32px;
                    text-align: center;
                   font-family: "MTTMilano-Medium";	
                   font-size: 16px;	
                   font-weight: bold;	
                }
                ol>li {
                    counter-increment: li; color: #001978;
                    margin-top: 30px;
                }
                ol>li>span {
                    margin-left: 8px;
                    height: 20px;
                    width: 442px;
                    color: #7F8CBB;
                    font-family: "MTTMilano-Medium";
                    font-size: 20px;
                    font-weight: 500;
                    line-height: 24px;
                }
                .two-columns {
                    columns: 2;
                    -webkit-columns: 2;
                    -moz-columns: 2;
                }
            `}
            </style>
        </Fragment>
    }
}