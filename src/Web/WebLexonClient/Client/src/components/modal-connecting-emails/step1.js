import React, { Fragment } from 'react';
import {
  CheckBoxComponent,
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

    this.changeSelectedMessages = this.changeSelectedMessages.bind(this);
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

  changeSelectedMessages(event, at) {
    at.checked = event.checked
    console.log(at)
  }

  render() {
    const { saveDocuments } = this.state;
    const { selected, attachments } = this.props;

    return (
      <Fragment>
        <div className='step1-container'>
          <ol>
            <li>
              <span>{i18n.t('connecting.q1')}</span>
              <ul className='list-checks'>
                <li>
                  <CheckBoxComponent
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
            {attachments && attachments.length > 0 && saveDocuments && (
                <li className="connect-list-2" style={{ marginBottom: 20 }}>
              <span>
                {i18n.t('connecting.q1b')}
                <span style={{ color: 'red' }}>*</span>
              </span>
                  <div className="file-list-wrapper">
                    <div >
                      {attachments.map((sm, index) => (
                          <MessageWithAttachments
                              key={'index' + index}
                              msg={sm}
                              onChange={this.changeSelectedMessages}
                          />
                      ))}
                    </div>
                  </div>
                </li>
            )}
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
            .connect-list-2::before {
                content: none !important;
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

const getAttachmentName = (attach) => {
  return attach.headers['content-type'][0].params.name;
};

const MessageWithAttachments = ({msg, onChange}) => {
  if (msg.attachments && msg.attachments.length > 0) {
    return (
        <div>
          <div className="subject">
            <i className="lf-icon-mail"></i>
            {msg.subject}
          </div>
          <ul className="attachments">
            {msg.attachments && msg.attachments.map((at, index) => {
              const an = getAttachmentName(at);
              return an ? (
                  <li key={'index' + index}>
                    <CheckBoxComponent
                        cssClass="e-small"
                        checked={at.checked}
                        change={(event) => {
                          onChange && onChange(event, at);
                        }}
                    ></CheckBoxComponent>
                    <span>{an}</span>
                  </li>
              ) : null;
            })}
          </ul>

          <style jsx>{`
          .subject {
            font-family: MTTMilano, Lato, Arial, sans-serif;
            font-size: 16px !important;
            align-items: center;
            display: flex;
          }
          .subject > i {
            font-size: 22px;
            margin: 5px;
          }

          .attachments {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            font-family: MTTMilano, Lato, Arial, sans-serif;
            font-size: 16px !important;
          }

          .attachments span {
            margin: 2px;
          }
          .e-small.e-checkbox-wrapper .e-frame {
            height: 18px;
            width: 18px;
            line-height: 10px;
          }
        `}</style>
        </div>
    );
  }

  return null;
};
