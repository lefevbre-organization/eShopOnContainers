import React, { PureComponent } from 'react';
import { withTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getNameEmail } from '../../../../utils';
import { sendMessage, getConversation } from '../../../../api_graph';

import moment from 'moment';
import { Button, Popover, PopoverBody } from 'reactstrap';
import { faBars, faReply, faShare } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './messageToolbar.scss';
import * as uuid from 'uuid/v4';

export class MessageToolbar extends PureComponent {
  constructor(props) {
    super(props);
    this.trashHandler = this.getClickHandler(['TRASH'], []);
    this.markAsUnread = this.getClickHandler(['UNREAD'], []);

    this.state = {
      confirm1Open: false,
      confirm2Open: false,
    };
  }

  getClickHandler(addLabels, removeLabels) {
    return (evt) => {
      this.props.onClick(addLabels, removeLabels);
    };
  }

  async componentDidMount() {
    if (
      this.props.messageResult.result.isReadReceiptRequested === true &&
      this.props.messageResult.result.isRead === false
    ) {
      this.setState({ confirm2Open: true });
      setTimeout(() => {
        this.setState({ confirm2Open: false });
      }, 9000);
    }
  }


  render() {
    const { t } = this.props;

    if (!this.props.messageResult.result) {
      return null;
    }

    const message = this.props.messageResult.result;
    const { messageHeaders } = message;

    let replyTo, cc, subject;
    subject = messageHeaders.subject;

    let confirmation = 0;
    if (messageHeaders.isReadReceiptRequested === true) {
      confirmation = 2;
    }

    replyTo = messageHeaders.from
      ? messageHeaders.from.emailAddress.address
      : '';

    const aux = []
    for (let i = 0; i < messageHeaders.ccRecipients.length; i++) {
      aux.push(messageHeaders.ccRecipients[i].emailAddress.address);
    }

    if(aux.length > 0) {
      cc = aux.join(',');
    } else {
      cc = undefined;
    }

    const nameEmail = getNameEmail(replyTo);
    let parsedDate = moment(messageHeaders.receivedDateTime);

    if (!parsedDate.isValid()) {
      parsedDate = moment(
        parseInt(this.props.messageResult.result.internalDate)
      );
    }

    const replyHeader = `<p>${t(
      'composemessage-toobar.on'
    )} ${parsedDate.format('MMMM Do YYYY, h:mm:ss a')} < ${
      nameEmail ? nameEmail.email : ''
    } > ${t('composemessage-toobar.wrote')}:</p>`;

    const composeProps = {
      subject: `Re: ${subject}`,
      to: nameEmail ? nameEmail.email : '',
      content: `<p>&nbsp;</p>
          <p>&nbsp;</p>
          <p>&nbsp;</p>
          ${replyHeader}
          <blockquote>${this.props.messageResult.body.content}</blockquote>`,
      cc: cc,
    };

    const composePropsFwd = {
      ...composeProps,
      subject: `Fwd: ${subject}`,
      to: '',
      isForward: true,
      cc: undefined,
    };

    const collapsed = this.props.sideBarCollapsed;

    return (
      <>
        <div className='d-flex justify-content-center align-items-center message-toolbar'>
          <div className='action-btns'>
            <span
              className={
                collapsed ? 'action-btn mr-2' : 'action-btn mr-2 with-side-bar'
              }>
              <Button
                onClick={this.props.sideBarToggle}
                className='btn-transparent'>
                <FontAwesomeIcon icon={faBars} size='1x' />
              </Button>
            </span>
            <div className='action-btn mr-2' title={t('message-toolbar.reply')}>
              <Link
                to={{
                  pathname: '/compose',
                  search: '',
                  sideBarCollapsed: this.props.sideBarCollapsed,
                  sideBarToggle: this.props.sideBarToggle,
                  state: { composeProps: {...composeProps, cc: undefined } },
                }}>
                <i className="lf-icon lf-icon-reply" style={{fontSize: 18, fontWeight: 'bold'}}></i>
              </Link>
            </div>
            <div className='action-btn mr-2' title={t('message-toolbar.reply-all')}>
              <Link
                  to={{
                    pathname: '/compose',
                    search: '',
                    sideBarCollapsed: this.props.sideBarCollapsed,
                    sideBarToggle: this.props.sideBarToggle,
                    state: { composeProps },
                  }}>
                <i className="lf-icon lf-icon-reply-all" style={{fontSize: 18, fontWeight: 'bold'}}></i>
              </Link>
            </div>
            <div
              className='action-btn mr-2'
              title={t('message-toolbar.resend')}>
              <Link
                to={{
                  pathname: '/compose',
                  search: '',
                  sideBarCollapsed: this.props.sideBarCollapsed,
                  sideBarToggle: this.props.sideBarToggle,
                  state: { composeProps: composePropsFwd },
                }}>
                <i className="lf-icon lf-icon-send" style={{fontSize: 18, fontWeight: 'bold'}}></i>
              </Link>
            </div>
            {message.importance === 'high' && (
              <div className='action-btn mr-2 icon-priority' title={'Urgente'}>
                <i className='lf-icon-bookmarks-active'></i>
              </div>
            )}
            <div
              onClick={this.markAsUnread}
              className='action-btn mr-2'
              title={t('message-toolbar.unread')}>
              <i style={{}} className='lf-icon lf-icon-mail'></i>
            </div>
          </div>
          <div
            className='action-btns'
            style={{
              justifyContent: 'flex-end',
              marginRight: 15,
            }}>
            {confirmation === 1 && (
              <>
                <div
                  id='Popover1'
                  className='action-btn mr-2 icon-priority'
                  onMouseEnter={() => {
                    this.setState({ confirm1Open: true });
                  }}
                  onMouseLeave={() => {
                    this.setState({ confirm1Open: false });
                  }}
                  onClick={() => {
                    //this.sendReadConfirmation();
                  }}>
                  <i className='lf-icon-step-done icon-red'></i>
                </div>
                <Popover
                  placement='left'
                  isOpen={this.state.confirm1Open}
                  target='Popover1'
                  className='popover-red'
                  toggle={() => {
                    this.setState({ confirm1Open: !this.state.confirm1Open });
                  }}>
                  <PopoverBody>
                    El remitente del mensaje ha solicitado confirmación de
                    lectura. Para enviar una confirmación, haz click en el
                    icono.
                  </PopoverBody>
                </Popover>
              </>
            )}
            {confirmation === 2 && (
              <>
                <div
                  id='Popover2'
                  className='action-btn mr-2 icon-priority'
                  onMouseEnter={() => {
                    this.setState({ confirm2Open: true });
                  }}
                  onMouseLeave={() => {
                    this.setState({ confirm2Open: false });
                  }}>
                  <i className='lf-icon-step-done icon-green'></i>
                </div>
                <Popover
                  placement='left'
                  isOpen={this.state.confirm2Open}
                  target='Popover2'
                  className='popover-green'
                  toggle={() => {
                    this.setState({ confirm2Open: !this.state.confirm2Open });
                  }}>
                  <PopoverBody>
                    Se ha enviado una confirmación de lectura al remitente.
                  </PopoverBody>
                </Popover>
              </>
            )}
          </div>
        </div>

        <style jsx>{`
          .action-btn > i {
            font-size: 20px;
            font-weight: bold;
            position: absolute;
            top: 22px;
            color: #001978;
          }

          .action-btn:hover > i {
            color: #0056b3;
          }
        `}</style>
      </>
    );
  }

  //   sendReadConfirmation() {
  //     const { messageResult } = this.props;
  //     const validTo = [messageResult.result.from.emailAddress.address];

  //     const headers = {
  //       To: validTo.join(', '),
  //       Subject: this.state.subject,
  //       attachments: [],
  //     };

  //     const email = {
  //       headers,
  //       to: headers.To,
  //       cc: '',
  //       bcc: '',
  //       uppyPreviews: [],
  //       content: 'Lectura confirmada :-)',
  //       subject: 'Confirmación de lectura',
  //       importance: 'Normal',
  //       internetMessageId: `<${uuid()}-${uuid()}@lefebvre.es>`,
  //     };

  //     sendMessage({
  //       data: email,
  //       attachments: [],
  //     })
  //       .then((_) => {
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //         debugger;
  //       });
  //   }
}

export default withTranslation()(MessageToolbar);
