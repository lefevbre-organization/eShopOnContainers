import React, { Fragment } from 'react';
import i18n from "i18next";
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import PerfectScrollbar from "react-perfect-scrollbar";

export class ConnectingEmailsStep4 extends React.Component {
    constructor() {
        super()

        this.state = {
           
        }

        this.onNextPage = this.onNextPage.bind(this)
        this.onPrevPage = this.onPrevPage.bind(this)
    }

    componentDidMount() {
    }

    onNextPage() {
        alert("onNextPage")
    }

    onPrevPage() {
        alert("onPrevPage")
    }

    onChange(id, subject) {
        const { onChange } = this.props;

        onChange && onChange(id, subject)
    }

    render() {
        return <Fragment>
            <div className="step4-container">
                <ol style={{ textAlign: "center" }}>
                    <li className="index-5">
                        <span>{i18n.t(`connecting.q5`)}</span>
                    </li>
                </ol>
                <p className="step4-subtitle">{i18n.t(`connecting.qs5`)}</p>
                <section className="panel-4 section-border">
                    <ul className="subjects-list">
                        <PerfectScrollbar style={{ height: "400px", paddingRight: "40px" }}>
                            {this.props.messages.map(msg => {
                                return (<li key={msg.id}>
                                    <p className="input-label">{i18n.t(`connecting.actuation-title`)}</p>
                                    <TextBoxComponent type="" placeholder="" cssClass="e-outline" autocomplete="off" value={msg.subject} change={(event)=>{
                                        this.onChange(msg.id, event.value)
                                    }}/>
                                </li>)
                            })} 
                        </PerfectScrollbar>
                    </ul>
                </section>
            </div>
            <style jsx>{`
                input.e-input::selection {
                    background-color: #001978 !important;
                }

                .step3-container {
                    margin: 30px;
                }

                .subjects-list {
                    width: 100%;
                    padding-left:40px;
                }

                .subjects-list  li {
                    margin-top: 10px;
                }

                ol>li.index-5::before {
                    content: '5'; 
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

                .step4-subtitle {
                    color: #333333 !important;
                    text-align: center !important;
                }
                
                .panel-4 {
                    display: flex;
                    height: 400px;
                }

                .input-label {
                    margin: 0;
                    color: #001978;
                    font-family: "MTTMilano-Medium" !important;
                    font-size: 14px;
                    font-weight: bold;
                    line-height: 22px;
                }
                              
                .panel-4.section-border {
                    position: sticky;
                    border: 1px solid #D2D2D2;
                    height: 400px;
                }

                .section-title {
                    color: #7C868C;
                    font-family: "MTTMilano-Medium" !important;
                    font-size: 14px;	
                    font-weight: 500;
                    margin-left: 10px;
                    margin-top: 10px;
                    text-transform: none;
                    vertical-align: text-top;
                }                

                .e-outline.e-input-group.e-control-wrapper.e-float-icon-left.e-input-focus:not(.e-success):not(.e-warning):not(.e-error):not(.e-disabled),
                .e-input-group.e-control-wrapper.e-float-icon-left.e-input-focus:not(.e-success):not(.e-warning):not(.e-error) .e-input,
                .e-outline.e-input-group:not(.e-input-focus), .e-outline.e-input-group:not(.e-success):not(.e-warning):not(.e-error):not(.e-float-icon-left):not(.e-input-focus), 
                .e-outline.e-input-group.e-control-wrapper:not(.e-success):not(.e-warning):not(.e-error):not(.e-float-icon-left):not(.e-input-focus),
                .e-input-focus {
                   border-color: #D2D2D2 !important;
                   box-shadow: none !important;
                }
            `}
            </style>
        </Fragment>
    }
}