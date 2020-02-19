import React, { Fragment } from 'react';
import { GridComponent, ColumnsDirective, ColumnDirective, Page, Search, Toolbar, Filter, Inject } from '@syncfusion/ej2-react-grids';
import i18n from "i18next";
import { RadioButtonComponent } from '@syncfusion/ej2-react-buttons';
import { getResults } from '../../services/services-lexon'
import Spinner from "../../components/spinner/spinner";

export class ConnectingEmailsStep2 extends React.Component {
    constructor() {
        super()
        this.state = {
            entities: [],
            rowSelected: -1,
            currentPage: 1,
            showSpinner: true
        }
        this.toolbarOptions = ['Search']
        this.renderCheck = this._renderCheck.bind(this);
        this.gridRef = null;
    }

    async componentDidUpdate(prevProps, prevState) {
        if (prevProps.entity !== this.props.entity ||
            prevState.currentPage !== this.state.currentPage) {
            const { user, bbdd, entity } = this.props;
            const { currentPage } = this.state;
            try {
                const response = await getResults(user, bbdd, entity, "", 6, currentPage);
                if (response && response.results && response.results.data) {
                    this.setState({ entities: [...response.results.data], showSpinner: false }, ()=>{
                    })
                }
            } catch (err) {
                console.log(err)
            }
        }
    }

    _renderCheck(props) {
        const ix = props.id + '_' + props.idType;
        const check = (ix === this.state.rowSelected ? 'checked' : '')
        return <div className={`row-check ${check}`}><div className={`row-check-inner ${check}`}></div></div>
    }

    nextPage() {
        const np = this.state.currentPage + 1;
        this.setState({ currentPage: np, showSpinner: true })
    }

    prevPage() {
        if (this.state.currentPage > 1) {
            const np = this.state.currentPage - 1;
            this.setState({ currentPage: np, showSpinner: true })   
        }
    }

    showSpinner() {
        this.setState({showSpinner: true})
    }

    hideSpinner() {
        this.setState({showSpinner: false})
    }

    render() {
        const { entity } = this.props;

        return <Fragment>
            <div className="step2-container">
                <ol>
                    <li className="index-3">
                        <span>{i18n.t("¿En que cliente quieres clasificar los mensajes?") + this.state.showSpinner}</span>
                    </li>
                </ol>
                <div style={{ height: 300 }}>
                    { this.state.showSpinner === true && 
                        <div className="spinner"> <Spinner /></div>
                    }
                    {this.state.showSpinner === false &&
                    <GridComponent ref={g => this.gridRef = g} dataSource={this.state.entities} height={'300px'} selectionSettings={{ type: 'Single', mode: 'Row' }}
                        hideScroll={true}
                        rowSelected={
                            (event) => {
                                this.setState({ rowSelected: event.data.id + '_' + event.data.idType });
                            }
                        }>
                        {entity === 1 &&
                            <ColumnsDirective>
                                <ColumnDirective headerText='' width='40' template={this.renderCheck} />
                                <ColumnDirective field='name' headerText='Código' width='100'></ColumnDirective>
                                <ColumnDirective field='intervening' headerText='Cliente' width='150'></ColumnDirective>
                                <ColumnDirective field='description' headerText='Descripción' width='170'></ColumnDirective>
                            </ColumnsDirective>}
                        {entity !== 1 &&
                            <ColumnsDirective>
                                <ColumnDirective field='description' headerText='Nombre' width='170'></ColumnDirective>
                                <ColumnDirective field='email' headerText='Email' width='150'></ColumnDirective>
                            </ColumnsDirective>}
                    </GridComponent>}
                    <section className="pager">
                        <div className="prevButton" onClick={() => this.prevPage()}><span className="pager-icon lf-icon-angle-left" /><span>Anterior</span></div>
                        <div className="nextButton" onClick={() => this.nextPage()}><span>Siguiente</span><span className="pager-icon lf-icon-angle-right" /></div>
                    </section>
                </div>
            </div>
            <style jsx>{`
                .step2-container {
                    margin: 50px;
                }

                .spinner {
                    width: 100%;
                    height: 100%;
                }

                .pager-icon {
                    font-size: 18px;
                    font-weight: bold;
                    color: #001978;
                }
                .prevButton,
                .nextButton {
                    display:flex;
                    align-items: center;
                    color: #001978;	
                    font-family: "MTTMilano-Medium" !important;
                    font-size: 12px;
                    font-weight: 500;
                    text-transform: uppercase;
                    cursor: pointer;
                }
                .pager {
                    display: flex;
                    width: 100%;
                    color: red;
                    justify-content: space-evenly;
                }
                .row-check {
                    width: 24px;
                    height: 24px;
                    border: 1px solid #7C868C;
                    border-radius: 50%;
                }
                .row-check-inner {
                    margin: auto;
                    margin-top: 2px;
                    width: 18px;
                    height: 18px;
                    background-color: transparent;
                    border-radius: 50%;
                }
                .row-check-inner.checked {
                    background-color: #001978 !important;
                }
                .row-check.checked {
                    border: 1px solid #001978 !important;
                }
                .e-content {
                    overflow-y: hidden !important;
                }
                .e-primary.list {
                    margin-top: -25px !important;
                    padding: 0 !important;
                }
                .e-rowcell .e-templatecell {
                    padding: 0 !important;
                }
                .e-row {
                    height: 50px !important;
                    cursor: pointer !important;
                }
                .e-rowcell {
                    color: #7C868C !important;
                    font-family: "MTTMilano-Medium" !important;
                    font-size: 14px !important;
                    font-weight: 500 !important;
                    line-height: 22px !important;
                    cursor: pointer !important;
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
                .e-grid,
                .e-gridheader,
                .e-headercontent
                {
                    border: none !important;
                }

                .e-headertext {
                    color: #001978 !important;
                    font-family: "MTTMilano-Medium" !important;	
                    font-size: 13px !important;	
                    font-weight: bold !important;
                }

                .e-gridheader {
                    border-top: none !important;
                    border-left: none !important;
                    border-right: none !important;
                    border-bottom: 1px solid #001978 !important;
                }
            `}
            </style>
        </Fragment>
    }
}