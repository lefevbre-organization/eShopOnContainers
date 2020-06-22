import React, { Fragment } from 'react';
import { CheckBoxComponent } from '@syncfusion/ej2-react-buttons';
import i18n from 'i18next';
import { Message } from '../../../store/messages/types';
import PerfectScrollbar from 'react-perfect-scrollbar';

interface Props {
  selected: Message[];
  attachments: boolean;
  onCopyEmail: (check: boolean) => void;
  onCopyAttachments: (check: boolean) => void;
}

interface State {
  types: any;
  copyEmail: boolean;
  copyAttachments: boolean;
  entity: number;
}

const MessageWithAttachments = ({ msg }: { msg: Message }) => {
  console.log('MessageWithAttachments.render');
  if (msg.attachments && msg.attachments.length > 0) {
    return (
      <div>
        <div className="subject">
          <i className="lf-icon-mail"></i>
          {msg.subject}
        </div>
        <ul className="attachments">
          {msg.attachments?.map((at) =>
            at.name ? (
              <li>
                <CheckBoxComponent
                  cssClass="e-small"
                  checked={at.checked}
                ></CheckBoxComponent>
                <span>{at.name}</span>
              </li>
            ) : null
          )}
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

export class Step1 extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      types: [],
      copyEmail: true,
      copyAttachments: true,
      entity: 1
    };
  }

  async componentDidMount() {}

  componentDidUpdate() {
    const { onCopyEmail, onCopyAttachments } = this.props;
    const { copyEmail, copyAttachments } = this.state;
    onCopyAttachments && onCopyAttachments(copyAttachments);
    onCopyEmail && onCopyEmail(copyEmail);
  }

  changeCheck1(event: any) {
    const { onCopyEmail } = this.props;
    this.setState({ copyEmail: event.checked }, () => {
      onCopyEmail(event.checked);
    });
  }

  changeCheck2(event: any) {
    const { onCopyAttachments } = this.props;
    this.setState({ copyAttachments: event.checked }, () => {
      onCopyAttachments(event.checked);
    });
  }

  render() {
    const { copyEmail, copyAttachments } = this.state;
    const { selected, attachments } = this.props;

    return (
      <Fragment>
        <div className="step1-container">
          <ol>
            <li>
              <span>
                {i18n.t('modal-archive.q1')}
                <span style={{ color: 'red' }}>*</span>
              </span>
              <ul className="list-checks">
                <li>
                  <CheckBoxComponent
                    label={i18n.t('modal-archive.copy-email')}
                    checked={copyEmail}
                    change={(data) => {
                      this.changeCheck1(data);
                    }}
                  />
                </li>
                {attachments && (
                  <li>
                    <CheckBoxComponent
                      label={i18n.t('modal-archive.copy-attachments')}
                      checked={copyAttachments}
                      change={(data) => {
                        this.changeCheck2(data);
                      }}
                    />
                  </li>
                )}
              </ul>
            </li>
            {attachments && copyAttachments && (
              <li style={{ marginBottom: 20 }}>
                <span>
                  {i18n.t('modal-archive.q1b')}
                  <span style={{ color: 'red' }}>*</span>
                </span>
                <div className="file-list-wrapper">
                  <PerfectScrollbar>
                    {selected.map((sm: Message) => (
                      <MessageWithAttachments msg={sm} />
                    ))}
                  </PerfectScrollbar>
                </div>
              </li>
            )}
          </ol>
        </div>
        <style jsx>
          {`
            .step1-container {
              margin: 50px;
              text-align: center;
            }

            .file-list-wrapper {
              margin-left: auto;
              margin-right: auto;
              margin-top: 20px;
              width: 400px;
              height: 300px;
            }

            ol {
              list-style: none;
              counter-reset: li;
            }
            .list-checks {
              text-align: left;
              width: 300px;
              margin-left: auto;
              margin-right: auto;
            }
            .list-checks li {
              margin-top: 10px;
            }
            ol > li.no-bullet::before {
              content: none;
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
              font-size: 16px !important;
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
            .e-checkbox-wrapper .e-frame + .e-label {
              font-size: 16px !important;
            }
          `}
        </style>
      </Fragment>
    );
  }
}
