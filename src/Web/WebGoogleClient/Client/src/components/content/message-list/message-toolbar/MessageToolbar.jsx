import React, { PureComponent } from 'react';
import { withTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faReply, faShare } from '@fortawesome/free-solid-svg-icons';
import { getNameEmail } from '../../../../utils';
import moment from 'moment';
import { Button } from 'reactstrap';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './messageToolbar.scss';
import i18n from "i18next";

export class MessageToolbar extends PureComponent {
  constructor(props) {
    super(props);
    this.trashHandler = this.getClickHandler(['TRASH'], []);
    this.markAsUnread = this.getClickHandler(['UNREAD'], []);
  }

  getClickHandler(addLabels, removeLabels) {
    return (evt) => {
      this.props.onClick(addLabels, removeLabels);
    };
  }

  parseCC(header) {
    const emails = header.value.split(',');
    const aux = [];
    console.log(header);
    console.log(emails);
    for(let i = 0; i < emails.length; i++) {
      const matches = emails[i].match(/<(.*?)>/);
      if (matches) {
        aux.push(matches[1]);
      }

    }

    header.value = aux.join(',');
    return header;
  }

  render() {
    const { t } = this.props;

    if (!this.props.messageResult.result) {
      return null;
    }

    const message = this.props.messageResult.result;
    const { messageHeaders } = message;

    let replyTo, cc, subject;

    for (let i = 0; i < messageHeaders.length; i++) {
      const header = messageHeaders[i];
      switch (header.name.toLowerCase()) {
        case 'subject':
          subject = header;
          break;
        case 'from':
          if (!replyTo) {
            replyTo = header;
          }
          break;
        case 'reply-to':
          replyTo = header;
          break;
        case 'cc':
          cc = this.parseCC(header);
          break;
        default:
          break;
      }
    }

    const nameEmail = getNameEmail(replyTo.value);
    const receivedHeader = messageHeaders.find(
      (el) => el.name === 'X-Received'
    );
    const date = receivedHeader
      ? receivedHeader.value.split(';')[1].trim()
      : '';

    let parsedDate = moment(date);

    if (!parsedDate.isValid()) {
      parsedDate = moment(
        parseInt(this.props.messageResult.result.internalDate)
      );
    }
    const replyHeader = `<p>${t(
      'composemessage-toobar.on'
    )} ${parsedDate.format('MMMM Do YYYY, h:mm:ss a')} < ${
      nameEmail.email
    } > ${t('composemessage-toobar.wrote')}:</p>`;

    const composeProps = {
      subject: `Re: ${subject.value}`,
      to: nameEmail.email,
      content: `<p>&nbsp;</p>
          <p>&nbsp;</p>
          <p>&nbsp;</p>
          ${replyHeader}
          <blockquote>${this.props.messageResult.body}</blockquote>`,
      ...(cc && { cc: cc.value }),
    };

    const composePropsFwd = {
      ...composeProps,
      subject: `Fwd: ${subject.value}`,
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
            {
              this.props.label !== 'TRASH'?(<div
                  className='action-btn mr-2'
                  title={t('message-toolbar.move-to-trash')}>
                <button
                    className='btn'
                    onClick={this.trashHandler}
                    style={{ backgroundColor: 'transparent' }}>
                  <i className="lf-icon lf-icon-trash" style={{fontSize: 18, fontWeight: 'bold', color: '#001978'}}></i>
                </button>
              </div>):<div className="action-btn" style={{fontSize: 12, textTransform:'uppercase', width: 120, color: '#001978'}} onClick={this.trashHandler}>
                <span>{i18n.t('message-list.empty-trash')}</span>
              </div>
            }
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
            <div
              onClick={this.markAsUnread}
              className='action-btn mr-2'
              title={t('message-toolbar.unread')}>
              <i style={{fontSize: 18}} className='lf-icon lf-icon-mail'></i>
            </div>
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
}

export default withTranslation()(MessageToolbar);
