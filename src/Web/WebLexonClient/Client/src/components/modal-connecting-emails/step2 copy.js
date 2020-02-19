import React, { Fragment } from 'react';
import { GridComponent, ColumnsDirective, ColumnDirective, Page, Search, Toolbar, Filter, Inject } from '@syncfusion/ej2-react-grids';
import i18n from "i18next";
import { getResults } from '../../services/services-lexon'

export class ConnectingEmailsStep2_COPY extends React.Component {
    constructor() {
        super()
        this.state = {
            entities: [],
            pageSettings: {
                currentPage: 1
            }
        }
        this.toolbarOptions = ['Search']
    }

    async componentDidUpdate(prevProps) {
        console.log(this.props.entity)
        if(prevProps.entity !== this.props.entity) {
            const { user, bbdd, entity } = this.props;
            try {
                const response = await getResults(user, bbdd, entity, "");
                console.log(response)
                if(response && response.results && response.results.data) {
                    this.setState({entities: response.results.data})
                } 
            } catch(err) {
                console.log(err)
            }
        }
    }

    render() {
        const { entity } = this.props;

        return <Fragment>
            <div className="step2-container">
            <ol> 
                <li className="index-3">
                    <span>{i18n.t("¿En que cliente quieres clasificar los mensajes?")}</span>                    
                </li>
            </ol>
            <div style={{height: 300}}>
            <GridComponent dataSource={this.state.entities} height={'300px'} selectionSettings={ { type: 'Single', mode: 'Row' }}>
                { entity === 1 &&
                <ColumnsDirective>                
                    <ColumnDirective field='name' headerText='Código' width='100'></ColumnDirective>
                    <ColumnDirective field='intervening' headerText='Cliente' width='150'></ColumnDirective>
                    <ColumnDirective field='description' headerText='Descripción' width='170'></ColumnDirective>
                </ColumnsDirective> }
                { entity !== 1 &&
                <ColumnsDirective>                
                    <ColumnDirective field='description' headerText='Nombre' width='170'></ColumnDirective>
                    <ColumnDirective field='email' headerText='Email' width='150'></ColumnDirective>
                </ColumnsDirective> }
            </GridComponent>
            </div>
            </div>
            <style jsx>{`
                .step2-container {
                    margin: 50px;
                }
                ol>li.index-3::before {
                    content: '3'; 
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
                .e-rowcell {
                    outline: none;
                }
            `}
            </style>
        </Fragment>
    }
}