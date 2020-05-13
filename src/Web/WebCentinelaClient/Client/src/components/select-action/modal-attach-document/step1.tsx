import React, { Fragment } from 'react';
import { CheckBoxComponent } from '@syncfusion/ej2-react-buttons';
import i18n from 'i18next';
import { Message } from '../../../store/messages/types';
import PerfectScrollbar from 'react-perfect-scrollbar';

interface Props {
  selected: Message[];
}

interface State {
  types: any;
}

export class Step1 extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      types: []
    };
  }

  async componentDidMount() {}

  componentDidUpdate() {}

  render() {
    const { selected } = this.props;
    return (
      <Fragment>
        <div className="step1-container">
          <ol>
            <li>
              <span>{i18n.t('modal-attach.q1')}</span>
            </li>
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
