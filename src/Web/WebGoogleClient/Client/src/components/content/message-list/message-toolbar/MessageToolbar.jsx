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
      switch (header.name) {
        case 'Subject':
          subject = header;
          break;
        case 'From':
          if (!replyTo) {
            replyTo = header;
          }
          break;
        case 'Reply-To':
          replyTo = header;
          break;
        case 'Cc':
          cc = header;
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
            <div
              className='action-btn mr-2'
              title={t('message-toolbar.move-to-trash')}>
              <button
                className='btn'
                onClick={this.trashHandler}
                style={{ backgroundColor: 'transparent' }}>
                <FontAwesomeIcon icon={faTrash} size='lg' />
              </button>
            </div>
            <div className='action-btn mr-2' title={t('message-toolbar.reply')}>
              <Link
                to={{
                  pathname: '/compose',
                  search: '',
                  sideBarCollapsed: this.props.sideBarCollapsed,
                  sideBarToggle: this.props.sideBarToggle,
                  state: { composeProps },
                }}>
                <FontAwesomeIcon icon={faReply} size='lg' />
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
                <FontAwesomeIcon icon={faShare} size='lg' />
              </Link>
            </div>
            <div
              onClick={this.markAsUnread}
              className='action-btn mr-2'
              title={t('message-toolbar.unread')}>
              <i style={{}} className='lf-icon lf-icon-mail'></i>
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
