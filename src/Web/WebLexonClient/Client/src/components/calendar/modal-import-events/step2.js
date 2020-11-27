import React, {Fragment} from 'react';
import {
    Inject,
    ProgressAnnotation, ProgressBarAnnotationDirective,
    ProgressBarAnnotationsDirective,
    ProgressBarComponent
} from "@syncfusion/ej2-react-progressbar";
import i18n from 'i18next';
import {DropDownListComponent} from "@syncfusion/ej2-react-dropdowns";
import {RadioButtonComponent} from "@syncfusion/ej2-react-buttons";
import {DatePickerComponent} from "@syncfusion/ej2-react-calendars";

const Frame = ({disabled, number, title, children}) => {
    return <div className="ie-frame" style={{opacity: disabled ? 0.5 : 1}}>
        <div className="ie-frame-header">
            <div className="ie-frame-number">{number}</div>
            <div className="ie-frame-title">{title}</div>
        </div>
        <div className="ie-frame-body">
            {children}
        </div>
    </div>
}

export class Step2 extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        // this.setState({progress: 0}, ()=>{
        //     this.uploadContacts();
        // });
    }

    componentWillUnmount() {
        // window.removeEventListener('contactUploaded', this.contactUploaded);

        // if(this.itv) {
        //     clearInterval(this.itv);
        //     this.itv = null;
        // }
    }

    render() {
        const { progress } = this.props;
        const disabled = progress < 100;

        return (
            <Fragment>
                <div className="progress-container">
                    <ProgressBarComponent id="label-container" ref={this.progresRef}
                                          type='Linear'
                                          width='100%'
                                          progressColor="#001978"
                                          trackThickness={26}
                                          progressThickness={26}
                                          showProgressValue={true}
                                          value={progress}
                                          labelStyle={{
                                              textAlignment: 'Center',
                                              fontFamily: 'MTTMilano-Medium',
                                              text: `MIGRADO ${progress}%`,
                                              color: '#fff'
                                          }}
                                          animation={{
                                              enable: false,
                                              duration: 2000,
                                              delay: 0,
                                          }}
                    >
                    </ProgressBarComponent>
                </div>
                <div className="ie-dialogborder">
                    <Frame disabled={disabled} number={20000} title={"Nº TOTAL"}>
                        <span className="lf-icon-calendar"></span>
                    </Frame>
                    <Frame disabled={disabled} number={19998} title={"MIGRADOS"}>
                        <span className="lf-icon-check-round"></span>
                    </Frame>
                    <div className="ie-warning-wrapper">
                        <Frame disabled={disabled} number={2} title={"NO MIGRADOS"}>
                            <span className="lf-icon-warning"></span>
                        </Frame>
                        <div className={`ie-frame-button ${disabled?'disabled':''}`} >
                            <span className="lf-icon-visible"></span>
                            <div style={{paddingTop: 4}}>VER INFORME</div>
                        </div>
                    </div>
                </div>
                <style jsx>{`
          
          .ie-warning-wrapper {
            display: flex;
            flex-direction: column;
          }
          .ie-frame-button {
            height: 34px;
            background-color: #C43741;
            cursor: pointer;
            color: white;
            display: flex;
            justify-content: center;
            font-size: 16px;
            font-family: MTTMilano-Medium;
            align-items: center;
          }
          
          .ie-frame-button.disabled {
            cursor: default;
            opacity: 0.5;
          }


          .ie-frame-button .lf-icon-visible {
            font-size: 22px;
            margin-right: 10px;
          }
          
          p {
            color: #333333;
            font-family: MTTMilano-Medium;
            font-size: 14px;
            font-weight: 500;
            letter-spacing: 0;
            line-height: 19px;
          }
          
          .ie-title {
            text-align: justify;
          }
          
          .ie-dialogborder {
            display: flex;
            border: 1px solid #d2d2d2;
            width: 100%;
            height: 389px;
            margin-bottom: 20px;
            padding: 20px;
          }
          
          .ie-dialogborder > div {
            flex: 1;
            height: 100%;
            margin: 10px;
          }
          
          .ie-buttonwrapper {
            width: 100%;
            text-align: right;
          }
          
          .ie-buttonwrapper > button:first-child {
            margin: 0 20px;
          }
            
          .ie-dropwrapper {
          margin-bottom: 20px;
          }
          
          .ie-dateswrapper {
            padding-top: 20px;
            display: flex;
          }
          
          .ie-dateswrapper > div {
            flex: 1;
            padding: 0 20px;
          }
          
          .ie-frame {
            background-color: #E5E8F1;
            flex: 1;
          }
          .ie-frame-header {
            height: 75px;
            background-color:#001978;
            display: flex;
            padding: 20px 10px;
          }
          
          .ie-frame-number{
            color: white;
            font-size: 45px;
            font-family: 'MTTMilano-Medium';
            font-weight: bold;          
        }          
       
          .ie-frame-title {
            color: white;
            font-size: 16px;
            font-family: 'MTTMilano-Medium';
            font-weight: bold;          
          }
        
        .ie-frame-body {
          display: flex;
          flex: 1;
          justify-content: center;
          align-items: center;
          height: calc(100% - 75px);
        }
        
            .ie-frame-body > span {
            font-size: 160px;
            }
            
            .ie-frame-body > span.lf-icon-calendar {
              color: #ccd1e4;
            }
            
            .ie-frame-body > span.lf-icon-check-round {
              color: #AFDDAD;
            }
            
            .ie-frame-body > span.lf-icon-warning {
              color: #D5909A;
            }
            
        `} </style>
            </Fragment>
        );
    }
}

