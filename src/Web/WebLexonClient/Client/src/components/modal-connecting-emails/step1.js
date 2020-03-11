import React, { Fragment } from 'react';
import {
  CheckBoxComponent,
  RadioButtonComponent
} from '@syncfusion/ej2-react-buttons';
import i18n from 'i18next';
import { getTypes } from '../../services/services-lexon';

export class ConnectingEmailsStep1 extends React.Component {
  constructor() {
    super();
    this.state = {
      types: [],
      actuation: true,
      copyDocuments: false,
      saveDocuments: false,
      entity: 1
    };
  }

  async componentDidMount() {
    try {
      const response = await getTypes();
      console.log(response);
      if (response && response.types) {
        this.setState({ types: response.types });
      }
    } catch (err) {
      console.log(err);
    }

    this.onChangeData();
  }

  onChangeData() {
    const { onChange } = this.props;
    onChange &&
      onChange({
        actuation: this.state.actuation,
        copyDocuments: this.state.copyDocuments,
        saveDocuments: this.state.saveDocuments,
        entity: this.state.entity
      });
  }

  changeCheck1(event) {
    this.setState({ copyDocuments: event.checked }, () => {
      this.onChangeData();
    });
  }

  changeCheck2(event) {
    this.setState({ saveDocuments: event.checked }, () => {
      this.onChangeData();
    });
  }

  render() {
    return (
      <Fragment>
        <div className='step1-container'>
          <ol>
            <li>
              <span>{i18n.t('connecting.q1')}</span>
              <ul className='list-checks'>
                <li>
                  <CheckBoxComponent
                    disabled
                    checked={this.state.actuation}
                    label={i18n.t('connecting.create')}
                    change={event => {
                      this.setState({ actuation: event.checked }, () => {
                        this.onChangeData();
                      });
                    }}
                  />
                </li>
                <li>
                  <CheckBoxComponent
                    label={i18n.t('connecting.copy')}
                    checked={this.state.copyDocuments}
                    change={data => {
                      this.changeCheck1(data);
                    }}
                  />
                </li>
                <li>
                  <CheckBoxComponent
                    label={i18n.t('connecting.save')}
                    checked={this.state.saveDocuments}
                    change={data => {
                      this.changeCheck2(data);
                    }}
                  />
                </li>
              </ul>
            </li>
            <li>
              <span>{i18n.t('connecting.q2')}</span>
              <ul className='two-columns'>
                {this.state.types.map(item => (
                  <li key={item.idEntity}>
                    <RadioButtonComponent
                      cssClass='e-primary'
                      label={i18n.t('classification.' + item.idEntity)}
                      name='entity'
                      checked={item.idEntity === 1}
                      change={() => {
                        this.setState({ entity: item.idEntity }, () => {
                          this.onChangeData();
                        });
                      }}
                    />
                  </li>
                ))}
              </ul>
            </li>
          </ol>
        </div>
        <style jsx>
          {`
            .step1-container {
              margin: 50px;
            }
            ol {
              list-style: none;
              counter-reset: li;
            }
            .list-checks li {
              margin-top: 10px;
            }
            ol > li::before {
              content: counter(li);
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
              font-weight: bold;
            }
            ol > li {
              counter-increment: li;
              color: #001978;
              margin-top: 30px;
            }
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
            }
          `}
        </style>
      </Fragment>
    );
  }
}
