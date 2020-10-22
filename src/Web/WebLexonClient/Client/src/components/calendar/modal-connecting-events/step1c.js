import React, { Fragment } from 'react';
import i18n from "i18next";
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';

export class ConnectingEmailsStep1c extends React.Component {
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

    onChange(subject) {
        const { onChange } = this.props;
        onChange && onChange(subject)
    }

    render() {
        console.log(this.props.messages)
        return <Fragment>
            <div className="step4-container">
                <ol style={{ textAlign: "center" }}>
                    <li className="index-5">
                        <span>{i18n.t(`classification-calendar.step1c.q1`)}</span>
                    </li>
                </ol>
                <p className="step4-subtitle">{i18n.t(`classification-calendar.step1c.q2`)}</p>
                <p className="input-label">{i18n.t(`classification-calendar.step1c.actuation-title`)}</p>
                <TextBoxComponent type="" placeholder={i18n.t(`classification-calendar.step1c.placeholder`)} cssClass="e-outline" autocomplete="off" value="" change={(event)=>{
                    this.onChange(event.value)
                }}/>

                {/*<p className="input-label">{i18n.t(`classification-calendar.step1c.category`)}</p>*/}

            </div>
            <style jsx>{`
                input.e-input::selection {
                    background-color: #001978 !important;
                }

                .step4-container {
                    margin: 30px;
                    height: 360px;
                }

                .subjects-list {
                    width: 100%;
                    padding-left:40px;
                }

                .subjects-list  li {
                    margin-top: 10px;
                }

                ol>li.index-5::before {
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

                .step4-subtitle {
                    color: #333333 !important;
                    font-family: "MTTMilano-Medium";	
                    font-size: 14px;
                    color: #333;
                    margin-top: 40px;
                    margin-bottom: 30px;
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
