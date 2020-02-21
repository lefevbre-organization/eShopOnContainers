import React, { Fragment } from 'react';
import i18n from "i18next";
import { TreeViewComponent } from '@syncfusion/ej2-react-navigations';
import { GridComponent, ColumnsDirective, ColumnDirective } from '@syncfusion/ej2-react-grids';
import Spinner from "../../components/spinner/spinner";

export class ConnectingEmailsStep3 extends React.Component {
    constructor() {
        super()

        this.state = {
            entities: [
                { name: 'Directorio 1', type: 'dir', modified: '26/09/2018 16:57' },
                { name: 'Directorio 2', type: 'dir', modified: '26/09/2018 16:57' },
                { name: 'Prueba de nombre de documento asociado al cliente', type: 'file', modified: '26/09/2018 16:57' },
                { name: 'Prueba de nombre de documento asociado al cliente', type: 'file', modified: '26/09/2018 16:57' },
                { name: 'Prueba de nombre de documento asociado al cliente', type: 'file', modified: '26/09/2018 16:57' },
                { name: 'Prueba de nombre de documento asociado al cliente', type: 'file', modified: '26/09/2018 16:57' },
                { name: 'Prueba de nombre de documento asociado al cliente', type: 'file', modified: '26/09/2018 16:57' },
            ]
        }

        this.hierarchicalData = [
            {
                id: '01', name: 'CLIENTE', expanded: true,
                subChild: [
                    {
                        id: '01-01', name: 'Directorio 1',
                    },
                    {
                        id: '01-02', name: 'Directorio 2', expanded: true,                        
                    }
                ]
            }
        ];
        this.fields = { dataSource: this.hierarchicalData, id: 'id', text: 'name', child: 'subChild' };
    }

    async componentDidUpdate(prevProps, prevState) {

    }

    render() {
        const { entity } = this.props;

        return <Fragment>
            <div className="step3-container">
                <ol style={{ textAlign: "center" }}>
                    <li className="index-4">
                        <span>{i18n.t(`connecting.q4`)}</span>
                    </li>
                </ol>
                <section className="panel section-border">
                    <div className="panel-left">
                        <TreeViewComponent fields={this.fields} />);
                    </div>
                    <div className="panel-right">
                        <div className="panel-right-top">
                            <span className="section-title">José Manuel García</span>
                        </div>
                        {this.state.showSpinner === true &&
                            <div className="spinner"> <Spinner /></div>
                        }

                        <GridComponent ref={g => this.gridRef = g} dataSource={this.state.entities} height={'300px'} selectionSettings={{ type: 'Single', mode: 'Row' }}
                            hideScroll={true}
                            locale="es-ES">
                            
                                <ColumnsDirective>
                                    <ColumnDirective field='name' headerText='Nombre' width='150'></ColumnDirective>
                                    <ColumnDirective field='type' headerText='Tipo' width='50'></ColumnDirective>
                                    <ColumnDirective field='modified' headerText='Modificación' width='100'></ColumnDirective>
                                </ColumnsDirective>
                        </GridComponent>
                        <section className="pager">
                            <div className={`prevButton`} onClick={() => {}}><span className="pager-icon lf-icon-angle-left" /><span>Anterior</span></div>
                            <div className="currentPage">1</div>
                            <div className={`nextButton`} onClick={() => {}}><span>Siguiente</span><span className="pager-icon lf-icon-angle-right" /></div>
                        </section>
                    </div>
                </section>
            </div>
            <style jsx>{`

                .step3-container {
                    margin: 30px;
                }
                
                .panel {
                    display: flex;
                    height: 450px;
                }

                .panel-left {
                    flex: 1;                    
                }

                .panel-right {
                    flex: 2;
                    border-left: 1px solid #001978;
                }
                .panel-right-top {
                    color: red;
                    border-bottom: 1px solid #001978;
                }
                
                .section-border {
                    position: sticky;
                    border: 1px solid #D2D2D2;
                    height: 450px;
                }

                .section-title {
                    color: #7C868C;;	
                    font-family: "MTTMilano-Medium" !important;
                    font-size: 14px;	
                    font-weight: 500;
                    margin-left: 10px;
                    margin-top: 10px;
                    text-transform: none;
                }

                ol>li.index-4::before {
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