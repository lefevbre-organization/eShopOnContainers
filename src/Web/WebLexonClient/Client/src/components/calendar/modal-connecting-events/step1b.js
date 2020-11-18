import React, { Fragment } from 'react';
import {
  CheckBoxComponent,
  RadioButtonComponent
} from '@syncfusion/ej2-react-buttons';
import i18n from 'i18next';
import {getActuationTypes, getTypes} from '../../../services/services-lexon';


export class ConnectingEmailsStep1b extends React.Component {
  constructor() {
    super();
    this.state = {
      types: [],
      entity: -1
    };
  }

  async componentDidMount() {
    try {
      const response = await getActuationTypes(this.props.bbdd, this.props.user);
      if (response && response.data) {
        this.setState({ types: response.data });
      }
    } catch (err) {
      console.log(err);
    }

    this.onChangeData();
  }

  onChangeData() {
    const { onChange } = this.props;
    onChange &&
      onChange(this.state.entity);
  }

  render() {
    const { types } = this.state;

    if(this.props.show === false) {
      return null;
    }

    return (
      <Fragment>
        <div className='step1b-container'>
          <ol>
            <li>
              <span>{i18n.t('classification-calendar.step1b.q1')}</span>
              <ul className='two-columns'>
                {types.map(item => (
                  <li key={item.id} onClick={()=>{console.log("SELECTED: " + item.id)
                    this.setState({ entity: item.id }, () => {
                      this.onChangeData();
                    });}}>
                    <RadioButtonComponent
                      cssClass='e-primary'
                      label={i18n.t('classification-calendar.step1b.' + item.id)}
                      name='entity'
                      checked={item.id === this.state.entity}
                    />
                  </li>
                ))}
              </ul>
            </li>
          </ol>
        </div>
        <style jsx>
          {`
            .step1b-container {
              margin: 50px;
            }
            ol {
              list-style: none;
              counter-reset: li;
            }
            .list-checks li {
              margin-top: 10px;
            }

            ol > li {
              counter-increment: li;
              color: #001978;
              margin-top: 30px;
            }
            
            .step1b-container ol > li:before {
              content: '2';
              color: #001978;
              display: inline-block;
              width: 1em;
              margin-left: -1em;
              background-color: #e5e8f1;
              border-radius: 50%;
              height: 32px;
              width: 32px;
              text-align: center;
              font-family: 'MTTMilano-Medium';
              font-size: 16px;
              font-weight: bold;            }
            
            ol > li > span {
              margin-left: 8px;
              height: 20px;
              width: 442px;
              color: #7f8cbb;
              font-family: 'MTTMilano-Medium';
              font-size: 20px;
              font-weight: 500;
              line-height: 24px;
            }
            .two-columns {
              columns: 2;
              -webkit-columns: 2;
              -moz-columns: 2;
              min-height: 180px;
              margin-top: 60px;
            }
          `}
        </style>
      </Fragment>
    );
  }
}
