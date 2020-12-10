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

const Warning = ({subject, title}) => {
  return <div className={"warning-wrapper"}>
    <span className={"lf-icon-calendar"}></span>
    <div>
      <div>{title}</div>
      <div><span style={{color: '#D0021B'}}>Asunto: </span>{subject}</div>
    </div>
  </div>
}

export class Step3 extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {

  }

  componentWillUnmount() {
  }

  render() {
    const { progress, errors, imported } = this.props;
    const disabled = progress < 100;

    return (
        <Fragment>
          <div className="progress-container">
            <p>Información sobre el resultado de la migración</p>
          </div>
          <div className="ie-dialogborder" style={{overflowY: "auto"}}>
            <div className={"ie-header"}>
              <div className={"ie-header1"}>EVENTOS NO MIGRADOS CORRECTAMENTE</div>
              <div className={"ie-header2"}>TOTAL: {errors.length}</div>
            </div>
            <div className="ie-advisor">
              <span className='lf-icon-warning'></span>
              <p>Se han migrado correctamente {imported} eventos, pero los siguientes no han podido ser migrados. Revisa la lista y prueba a migrarlos de nuevo o bien introdúcelos manualmente.</p>
            </div>
            <div>
              {errors && errors.map( err => {
                const date = err.event.startDate.substr(0,10);
                const summary = err.event.subject;
                const body = err.error.body?JSON.parse(err.error.body) : 'Error desconocido';
                return <Warning title={date + ' ' + summary } subject={body.error.message}></Warning>
              }) }
            </div>

          </div>
          <style jsx>{`
          
          .warning-wrapper {
            display: flex;
            display: flex;
            border-bottom: 1px solid #D0021B;
            margin-bottom: 15px;
            padding: 10px;
                  }
          .warning-wrapper > span {
            color: #D0021B;
            font-size: 22px;
            margin-right: 10px;
          }
          
          .ie-advisor {
            background-color: #001978;
            color: white;
            display: flex;
            padding: 20px;
            align-items: flex-end;
          }
          .ie-advisor > span {
          font-size: 80px;
          margin-right: 20px;
          }
          .ie-advisor > p{
            font-family: MTTMilano-Medium;
            color: white;
            font-size: 18px;
          }
          .ie-header {
            flex: 0 !important;
            border-bottom: 1px solid #001978;
            color: #001979;
            display: flex;
            /* font-weight: bold; */
            justify-content: space-between;
            font-family: MTTMilano-Medium;
          }
          
          .ie-header1 {
            font-weight: bold;
            font-size: 20px;
          }
          
          .ie-header2 {
            font-weight: bold;
          }
          
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
            flex-direction: column;
            border: 1px solid #d2d2d2;
            width: 100%;
            height: 389px;
            margin-bottom: 20px;
            padding: 20px;
          }
          
          .ie-dialogborder > div {
            flex: 0;
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

