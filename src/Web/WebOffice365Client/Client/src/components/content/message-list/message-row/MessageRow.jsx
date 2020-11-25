import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import MesssageCheckbox from './MessageCheckbox';

import NameSubjectFields from './NameSubjectFields';
import AttachmentDateFields from './AttachmentDateFields';
import { getNameEmail } from '../../../../utils';

export class MessageItem extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      dragging: false
    }

    this.onSelectionChange = this.onSelectionChange.bind(this);
    this.getMessage = this.getMessage.bind(this);

    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.clone = null;
  }

  onSelectionChange(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    this.props.onSelectionChange({ action: evt.target.checked?'check':'uncheck', data: [this.props.data]});
  }

  getMessage(evt) {
    const EncodeIdMessage = encodeURI(this.props.data.id);
    this.props.history.push(`/${EncodeIdMessage}`);
    // if(this.props.data.isDraft){
    //   this.props.history.push(`/compose/${EncodeIdMessage}`);
    // } else {
    //   this.props.history.push(`/${EncodeIdMessage}`);
    // } 
  }

  getFromName(from) {
    const nameEmail = getNameEmail(from);
    return nameEmail.name;
  }

  getFormattedDate(date, fallbackDateObj) {
    let messageDate = moment(date);
    var locale = window.navigator.userLanguage || window.navigator.language;
    if (locale === 'es-ES') {
      moment.lang('es', {
        months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split(
          '_'
        ),
        monthsShort: 'Enero._Feb._Mar_Abr._May_Jun_Jul._Ago_Sept._Oct._Nov._Dec.'.split(
          '_'
        ),
        weekdays: 'Domingo_Lunes_Martes_Miercoles_Jueves_Viernes_Sabado'.split(
          '_'
        ),
        weekdaysShort: 'Dom._Lun._Mar._Mier._Jue._Vier._Sab.'.split('_'),
        weekdaysMin: 'Do_Lu_Ma_Mi_Ju_Vi_Sa'.split('_'),
      });
    }

    if (!messageDate.isValid()) {
      messageDate = moment(fallbackDateObj.parserFn(fallbackDateObj.date));
    }
    const nowDate = moment(new Date());
    const isMessageFromToday =
      messageDate.format('YYYYMMDD') === nowDate.format('YYYYMMDD');
    let formattedDate;
    if (isMessageFromToday) {
      formattedDate = messageDate.format('h:mm A');
    } else {
      if (messageDate.year() !== nowDate.year()) {
        formattedDate = messageDate.format('YYYY/MM/DD');
      } else {
        formattedDate = messageDate.format('MMM D');
      }
    }

    return formattedDate;
  }

  onDragStart(evt) {
    this.setState({dragging: true});

    // Clone element:
    this.clone = evt.currentTarget.cloneNode(true);
    this.clone.style.backgroundColor = "#f9f9f9";
    this.clone.style.position = "absolute";
    this.clone.style.top = "-1000px";
    this.clone.style.right = "0px";
    document.body.appendChild(this.clone);

    evt.dataTransfer.setDragImage(this.clone, 0, 0);
    evt.dataTransfer.dropEffect = 'move';
    evt.dataTransfer.setData("text/plain", JSON.stringify(this.props.data));

    return true;
  }

  onDragEnd(evt) {
    this.setState({dragging: false});
    document.body.removeChild(this.clone);
    return true;
  }

  render() {
    const sc = true;
    const date = this.props.data.receivedDateTime;
    let formattedDate = this.getFormattedDate(date, {
      date: this.props.data.internalDate,
      parserFn: parseInt,
    });
    const unread = this.props.data.isRead === false ? ' font-weight-bold' : '';
    const selected = '';
    const subject = this.props.data.subject;
    let fromName = '';

    //For unusual cases taht the data.from.emailAddress not exist -  to-do Alberto
    //(ask for undefined object)
    try {
      // const fromHeader =
      //   this.props.data.from.emailAddress.name.toUpperCase() +
      //   " " +
      //   this.props.data.from.emailAddress.address;
      if (this.props.isSent === false) {
        fromName = this.props.data.from.emailAddress.name;
      } else {
        fromName = this.props.data.toRecipients[0].emailAddress.name;
      }
    } catch {
      // const fromHeader = "";
    }

    return (
        <div draggable="true"  className={`message-row-item d-flex table-row-wrapper${selected} chk-msg-row${sc?'-sc':''} ${this.state.dragging?'dragging':''}`}
             onDragStart={this.onDragStart}
             onDragEnd={this.onDragEnd}
        >
          <div className="msg-list-chk-wrapper">
            <MesssageCheckbox
                selected={this.props.data.selected}
                onChange={this.onSelectionChange}
            />
          </div>
        <div
          onClick={this.getMessage}
          className={`table-row px-2 py-3${unread}`}>
          <NameSubjectFields fromName={fromName} subject={subject} />
          {this.props.data.importance === 'high' && (
            <div>
              <i className='lf-icon-bookmarks-active'></i>
            </div>
          )}
          <AttachmentDateFields
            formattedDate={formattedDate}
            hasAttachment={
              //this.props.data.payload.mimeType === "multipart/mixed"
              this.props.data.hasAttachments
            }
          />
        </div>
      </div>
    );
  }
}

export default withRouter(MessageItem);
