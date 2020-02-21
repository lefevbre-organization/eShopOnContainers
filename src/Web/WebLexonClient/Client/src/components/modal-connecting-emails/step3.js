import React, { Fragment } from 'react';
import { GridComponent, ColumnsDirective, ColumnDirective, Page, Search, Toolbar, Filter, Inject } from '@syncfusion/ej2-react-grids';
import { L10n } from '@syncfusion/ej2-base';
import i18n from "i18next";
import { RadioButtonComponent } from '@syncfusion/ej2-react-buttons';
import { getResults } from '../../services/services-lexon'
import Spinner from "../../components/spinner/spinner";
import ClassificationListSearch from "../classify-emails/classification-list-search/classification-list-search";


export class ConnectingEmailsStep3 extends React.Component {
    constructor() {
        super()
    }

    async componentDidUpdate(prevProps, prevState) {

    }


    render() {
        const { entity } = this.props;

        return <Fragment>
            <div className="step3-container">
                <ol style={{textAlign: "center"}}>
                    <li className="index-3">
                        <span>{i18n.t(`connecting.q4`)}</span>
                    </li>
                </ol>                
            </div>
            <style jsx>{`

                .step3-container {
                    margin: 30px;
                }

                ol>li.index-3::before {
                    content: '4'; 
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
            `}
            </style>
        </Fragment>
    }
}